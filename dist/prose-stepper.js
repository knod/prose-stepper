/* prose-stepper.js
* 
* Step back and forth through sentences and words
* Also splits up the words into fragments if needed?
* 
* 
* TODO:
* - ??: Add stepping for paragraph?
* - Reset values non-destructively
* - Module just for navigating within arrays of arrays? (that can
*   be changed?)
* - ??: Allow -1 at the beginning of a sentenceArray to loop around
*   to the end?
* - ??: On frag increment, don't just stop at next word, keep
*   iterating by the given frag change? Would fast-forwarding then
*   give unexpected behavior?
* - ??: Provide explicit way to get to beginning of current
*   word? Current sentence?
*       - ??: [0,0,0] === get current word means get current fragment? Or
*           means get the start of the current word?
* - ??: Same navigation for mid-word as mid-sentence? -1 means
*   "if in middle, go back to start"?
* - Determine maxChars assignment - can be set in `.getFragemnt()`
*   (maybe too invisible), or must use explicit `.setMaxChars()`
*   (kind of annoying)? Set in `.restart()` similarly? Required at
*   `.process()`?
* - Refactor `._stepFragment()` so that `.rawWord` isn't changed
*   invisibly
*/

(function (root, stepFactory) {  // root is usually `window`
    if (typeof define === 'function' && define.amd) {  // amd if possible
        // AMD. Register as an anonymous module.
        define( ['@knod/hyphenaxe'], function (hyphenaxe) { return ( root.ProseStepper = stepFactory(hyphenaxe) ) });
    } else if (typeof module === 'object' && module.exports) {  // Node-ish next
        // Node. Does not work with strict CommonJS, but only CommonJS-like
        // environments that support module.exports, like Node.
        module.exports = stepFactory( require('@knod/hyphenaxe') );
    } else {  // Global if nothing else
        // Browser globals
        root.ProseStepper = stepFactory( hyphenaxe );
    }
}(this, function ( split ) {
/* ( func ) -> ProseStepper */

    "use strict";

    var ProseStepper = function () {
    /* ( {} ) -> ProseStepper
    * 
    * Provides commands for getting the words/fragments passed into
    * its `.process()`. 
    * Always use .getFragment()
    */
        var pst = {};

        pst.index    = 0;
        pst.position    = [ 0, 0, 0 ];
        pst.rawWord     = null;
        // `pst.splitWord` isn't just a string. It's not from the sentence/word
        // array, it's a word once it has been fragmented into a list of strings
        pst.splitWord   = null;  // [ Str ]


       // =====================================
       // INTERNAL
       // =====================================

        pst._split      = split;  // func
        pst._progress   = 0;
        var sentences   = pst._sentences = null;
        var positions   = pst._positions = [];
        pst._maxChars;  // TODO: ??: Default or required argument? Default hides errors?



       // =====================================
       // SET UP NEW DATA
       // =====================================

        pst.process = function ( sentenceArray, maxChars ) {
        /* 
        * TODO: Some way to get maxChars out of here. Need it for
        * establishing the first current word, which is needed
        * for consistency with frags/pos[2]
        */
            ifNotArrayOfArraysOfStrings( sentenceArray );

            pst.setMaxChars( maxChars )

            sentences = pst._sentences = sentenceArray;  
            positions.splice( 0, positions.length );  // Empty non-destructively

            for ( let senti = 0; senti < sentences.length; senti++ ) {
                let sentence  = sentences[senti];
                for (let wordi = 0; wordi < sentence.length; wordi++) {
                    positions.push([ senti, wordi ]);
                }
            }

            pst.restart( pst._maxChars )

           return pst;
        };


        // ??: Should this even exist as its own thing?
        pst.setMaxChars = function ( maxChars ) {
        /* ( int >= 0 ) -> ProseStepper
        * 
        * If the value is a positive integer >= 0, it will be stored.
        * Otherwise, an error will be thrown.
        */
            ifNotPositiveInt( maxChars );
            pst._maxChars = maxChars;  // Only store after error is avoided
            return pst;
        };



       // =====================================
       // GETS
       // =====================================

        pst.getProgress = function () {
            pst._progress = pst.index / (positions.length - 1);
            return pst._progress;
        };
        pst.getLength = function () { return positions.length; };
        pst.getIndex = function () { return pst.index; }



        // =====================================
        // RUNTIME
        // =====================================
        // Traveling the words/sentences (for external use)

        pst.restart = function ( maxChars ) {
            // ??: Return first fragment?

            // If there's not already a value for internal maxChars,
            // we absolutely need one here
            if ( maxChars !== undefined && pst._maxChars !== maxChars ) {
                pst.setMaxChars( maxChars );
            }

            pst.index    = 0;
            pst.position = [ 0, 0, 0 ];

            pst.rawWord     = pst._stepWord( pst.index );
            pst.splitWord   = pst._split( pst.rawWord, pst._maxChars );

            return pst;
        };


        pst.getFragment = function ( changesOrIndex, maxChars ) {
        /* ( [int, int, int] or int ) -> Str
        * 
        * Currently it seems that only one of the ints can be something
        * other than 0.
        * TODO: Is another method ever needed? Find out.
        */
            ifNotArrayOfIntsOrInt( changesOrIndex ); // Throw errors if needed

            var pos             = pst.position,
                maxCharsChanged = false,
                fragIndex       = 0;

            // If maxChars is changed, store new value internally,
            // re-fragment word and start at the beginning of word
            // (TODO: or map current progress to new fragment array?)
            if ( maxChars !== undefined && pst._maxChars !== maxChars ) {
                pst.setMaxChars( maxChars );
                maxCharsChanged = true;
            }

            // if plain index change/jump
            if ( typeof changesOrIndex === 'number' ) {
                pst.rawWord = pst._indexJump( changesOrIndex );

            // !!! CAN ONLY CHANGE ONE POSITION AT A TIME !!! \\

            } else if ( changesOrIndex[0] !== 0 ) {  // sentence change
                pst.rawWord = pst._stepSentence( changesOrIndex[0] );
            } else if ( changesOrIndex[1] !== 0 ) {  // word change
                pst.rawWord = pst._stepWord( pst.index + changesOrIndex[1] );
            } else if ( changesOrIndex[2] !== 0 ) {  // fragment change
                // This is confusing because it invisibly changes `.rawWord` sometimes
                fragIndex = pst._stepFragment( changesOrIndex[2] )
            // If no change, get whatever's current
            } else {
                // currently, [0,0,0] === get current fragment
                fragIndex = pos[2];
            } // end if index or which position changed

            // In case rawWord has changed
            pst.splitWord = pst._split( pst.rawWord, pst._maxChars );

            // If not a fragment change or if maxChars was changed,
            // negating the validity of old fragment positions
            if ( maxCharsChanged ) { pos[2] = 0; }
            else { pos[2] = fragIndex }
            
            var frag = pst.splitWord[ pos[2] ];
            return frag;
        }  // End pst.getFragment()



        // =====================================
        // TRAVEL INTERNAL HELPERS
        // =====================================

        pst._indexJump = function ( index ) {
        /* ( int ) -> Str
        * 
        * Circle to the end if the index is negative, return
        * a new word.
        */
            // act like array indexes - negative numbers come back from the end
            if ( index < 0 ) { index = pst.getLength() + index; }
            return pst._stepWord( index );
        };  // End pst._indexJump()


        pst._stepFragment = function ( fragChange ) {
        /*
        * 
        * NOTE: This returns an index number for the fragment position,
        * not a new word (unlike other steps/jumps)
        */
            var pos         = pst.position,
                fragi       = pos[2] + fragChange,
                returnIndex = 0;

            // if current fragment starts new word
            // Note: doesn't skip more than one word at a time and starts
            // at the beginning of the next word, no matter the step value
            if ( fragi >= pst.splitWord.length ) {
                pst.rawWord = pst._stepWord( pst.index + 1 );
            
            } else if (fragi < 0) {
                pst.rawWord = pst._stepWord( pst.index - 1 );

            } else {
                // don't change index or current word, just current fragment position
                // The only place where pos[2] isn't 0
                returnIndex = fragi;
            }

            return returnIndex;
        };  // End pst._stepFragment()


        pst._stepWord = function ( index ) {
        // ( int ) -> [ Str ]
            pst.index       = pst.normalizeIndex( index );
            var pos         = positions[ pst.index ];
            pst.position[0] = pos[0];
            pst.position[1] = pos[1];
            var word        = sentences[ pst.position[0] ][ pst.position[1] ];
            return word;
        };  // End pst._stepWord()


        pst._stepSentence = function ( sentenceChange ) {
        // ( int ) -> Int
            if ( sentenceChange === 0 ) { return 0; }

            var pos     = [ pst.position[0], pst.position[1] ],
                senti   = pos[0],
                wordi   = pos[1];

            // If in the last sentence, go to the last word
            if ( (sentenceChange + senti) > (sentences.length - 1) ) {
                senti = sentences.length - 1;
                wordi = sentences[ senti ].length - 1;

            } else {
                // If we're in the middle of a sentence and we're
                // only going back one step, go back to the beginning of the sentence
                if ( sentenceChange === -1 && wordi > 0 ) {}  // No change to sentence
                // otherwise change sentence
                else { senti += sentenceChange; }
                // Either way, word is first word of sentence
                wordi = 0;
            }  // end if at last sentence

            pos[1] = wordi;
            pos[0] = pst.normalizeSentencePos( senti );

            var newIndex = pst._sentenceChangeToIndex( sentenceChange, pos );
            if ( newIndex === null ) { newIndex = pst.index; }

            return pst._stepWord( newIndex );
        };  // End pst._stepSentence


        pst._sentenceChangeToIndex = function ( sentenceChange, newPos ) {
        /* ( int ) -> Int or null
        * 
        * Given the direction of change and the position desired, find the
        * index of the new position.
        * Only used for sentence changes. If we need something else,
        * we'll see about that then. Just trying to speed up the search.
        */
            if ( sentenceChange === 0 ) { return 0; }  // signOf shouldn't return NaN now

            var incrementor = signOf( sentenceChange ),  // 1 or -1
                tempi       = pst.index,
                found       = false;

            // Until we find the position or there are no more positions left
            while ( !found && positions[ tempi ] ) {
                // Test out positions
                var pos = positions[ tempi ];
                if ( pos[0] === newPos[0] && pos[1] === newPos[1] ) {
                    found = true;
                }
                // If not found, keep going until there are no more positions left in the list
                if (!found) { tempi += incrementor; }
            }

            // If we went through all the list we could and didn't find anything, say so
            // Not quite sure why that would happen, though
            if ( !positions[tempi] ) { tempi = null; }

            return tempi;
        };  // End pst._sentenceChangeToIndex()



       // =====================================
       // UTILITIES
       // =====================================

        var signOf = function ( num ) {
            return typeof num === 'number' ? num ? num < 0 ? -1 : 1 : num === num ? num : NaN : NaN;
        }

        var isInt = function ( arg ) {
            return ( typeof arg === 'number' ) && !isNaN( arg ) && ( arg % 1 === 0 )
        };  // End isInt()

        pst.normalizeIndex = function ( index ) {
        /* Don't go out of the array */
            index = Math.min( index, positions.length - 1 );  // max
            return Math.max( index, 0 );  // min
        };
        pst.normalizeSentencePos = function ( senti ) {
        /* Don't go out of the array */
            senti = Math.min( senti, (sentences.length - 1) );
            return Math.max( senti, 0 );
        };



        // =====================================
        // ERRORS
        // =====================================

        var ifNotArrayOfArraysOfStrings = function ( arg ) {
        /* ( [[str]] ) -> True or throw error
        * 
        * Will throw necessary errors for bad references or things that
        * aren't arrays of arrays of strings. Otherwise, will return `true`
        */

            var msg = 'Was expecting an array of array of strings. Recieved: ' + Object.prototype.toString.call( arg );

            if ( arg === undefined ) { throw new ReferenceError( msg ); }

            try {
                var first   = arg[0],  // string would pass (which would be wrong)
                    second  = first[0],  // string would pass (which would be wrong)
                    third   = second.substr(0, 1),
                    // In case a string passed those eariler tests
                    wasStr  = typeof arg === 'string' || typeof first === 'string';

                if (wasStr) { throw new TypeError( msg ); }

            } catch (err) {
                throw new TypeError( msg );
            }
            
            return true;
        };  // End ifNotArrayOfArraysOfStrings()


        var ifNotArrayOfIntsOrInt = function ( arg ) {
        /* ( int || [ int ] ) -> True or throw error
        * 
        * Will throw necessary errors for bad references or things that
        * aren't ints or arrays of ints. Otherwise, will return `true`
        */
            var msg = 'Was expecting an array of integers. Recieved: ' + Object.prototype.toString.call( arg );

            // Can be positive or negative
            if ( isInt( arg ) ) { return true; }  // Can be an index position

            // Otherwise must be an array of ints
            if ( arg === undefined ) { throw new ReferenceError( msg ) }

            // no errors on [0, 0, 0]
            if ( !isInt( arg[0] ) ) { throw new TypeError( msg ) }

            for (var itemi = 0; itemi < arg.length; itemi++) {
                if ( !isInt( arg[ itemi ] ) ) {
                    throw new TypeError( msg )
                }  // Throw error
            }
            // Otherwise, we're cool
            return true;
        };  // End ifNotArrayOfInts


        var ifNotPositiveInt = function ( arg ) {
        /* ( int >= 0 ) -> True or throw error
        * 
        * Will throw necessary errors for bad references or non-numbers.
        * Otherwise, will return `true`
        */
            var msg = 'Was expecting positive integer > 0. Recieved: ' + Object.prototype.toString.call( arg );

            if ( arg === undefined ) {
                throw new ReferenceError( msg );
            } else if ( !isInt( arg ) || !(arg >= 0) ) {
                throw new TypeError( msg );
            }
            // Otherwise, we're cool
            return true;
        };  // End ifNotPositiveInt()



       // =====================================
       // DONE
       // =====================================

        return pst;
    };  // End ProseStepper() -> {}

    return ProseStepper;
}));
