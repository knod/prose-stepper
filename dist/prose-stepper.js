/* prose-stepper.js
* 
* Step back and forth through sentences and words
* Also splits up the words into fragments if needed?
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

    var ProseStepper = function ( state ) {
    /* ( {} ) -> ProseStepper
    * 
    * `state` is a reference to a never-destroyed object containing
    * options for the word splitter, as well as for the ProseStepper
    * instance itself.
    * 
    * Provides commands for getting the words/fragments passed into
    * its `.process()`. 
    * Always use .getFragment()
    */
        var pst = {};



        // =====================================
        // EXTERNAL
        // =====================================
        // TODO: Discuss external availability of these values

        pst.index       = 0;
        pst.position    = [ 0, 0, 0 ];
        pst.rawWord     = null;
        // `pst.fragments` isn't just a string. It's not from the sentence/word
        // array, it's a word once it has been fragmented into a list of strings
        pst.fragments   = null;  // [ Str ]



        // =====================================
        // INTERNAL
        // =====================================
        var sentences, positions;
        // Just the required stuff. Other stuff can be undefined.
        var defaults = {
            maxNumCharacters: 13,
            minLengthForSeparator: 3,
        };



       // =====================================
       // SET UP NEW DATA
       // =====================================

        pst.process = function ( sentenceArray ) {
        /* ( [[Str]] ) -> ProseStepper
        * 
        * 
        */
            notArrayOfArraysOfStringsErrors( sentenceArray );

            sentences = pst._sentences = sentenceArray;  
            positions.splice( 0, positions.length );  // Empty non-destructively

            for ( let senti = 0; senti < sentences.length; senti++ ) {
                let sentence  = sentences[senti];
                for (let wordi = 0; wordi < sentence.length; wordi++) {
                    positions.push([ senti, wordi ]);
                }
            }

            pst.restart()

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

        pst.setState = function ( newState ) {
        /* ( {} ) -> ProseStepper
        * 
        * Be careful, this is not where the errors will happen
        * yet.
        */
            pst._state = newState;
            return pst;
        };


        pst.restart = function () {
            // ??: Return first fragment?

            pst._oldMaxChars = getStateProp( 'maxNumCharacters' );
            // TODO: instead, store JSON state and compare to new JSON state?
            // Any change will require adjustments

            pst.index    = 0;
            pst.position = [ 0, 0, 0 ];

            pst.rawWord     = pst._stepWord( pst.index );
            pst.fragments   = pst._split( pst.rawWord, getStateProp( 'maxNumCharacters' ) );

            return pst;
        };


        pst.getFragment = function ( changesOrIndex ) {
        /* ( [int, int, int] or int ) -> Str
        * 
        * Currently it seems that only one of the ints can be something
        * other than 0.
        * TODO: Is another method ever needed? Find out.
        */
            notArrayOfIntsOrIntErrors( changesOrIndex ); // Throw errors if needed

            var pos             = pst.position,
                // TODO: If any state change, probably need to re-split word
                maxCharsChanged = false,
                fragIndex       = 0;

            // If maxChars is changed, store new value internally,
            // re-fragment word and start at the beginning of word
            // (TODO: or map current progress to new fragment array?)
            if ( pst._oldMaxChars !== getStateProp( 'maxNumCharacters' ) ) {
                pst._oldMaxChars = getStateProp( 'maxNumCharacters' );
                maxCharsChanged  = true;
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

            // Get the array of strings that is the split word
            pst.fragments = pst._getTheSplit();

            // If not a fragment change or if maxChars was changed,
            // negating the validity of old fragment positions
            if ( maxCharsChanged ) { pos[2] = 0; }
            else { pos[2] = fragIndex }

            var frag = pst.fragments[ pos[2] ];
            return frag;
        }  // End pst.getFragment()



        // =====================================
        // TRAVEL INTERNAL HELPERS
        // =====================================

        pst._getTheSplit = function () {
        /* ( None ) -> [ Str ]
        * 
        * Uses all internal stuff to split the `.rawWord` and return
        * it as an array of strings.
        */
            // Values for splitter
            var sep = getStateProp( 'separator' );
            var maxChars = getStateProp( 'maxNumCharacters' );
            if ( maxChars < getStateProp( 'minLengthForSeparator' ) ) { sep = ''; }

            var toPass = {
                separator: sep,
                fractionOfMax: getStateProp( 'fractionOfMax' ),
                redistribute: getStateProp( 'redistribute' )
            }

            return pst._split( pst.rawWord, maxChars, toPass );
        };  // End pst._getTheSplit()


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
        /* ( int ) -> Int
        * 
        * NOTE: This returns an index number for the fragment position
        * (`.position[2]`), not a new word (unlike other steps/jumps)
        * May also change the `.rawWord` value.
        * 
        * Progresses forward or backward through fragments, but with a
        * maximum change of one word, no matter how big the change.
        * Returns the new fragment position, which will be 0 if there's
        * a word change.
        */
            var pos         = pst.position,
                fragi       = pos[2] + fragChange,
                returnIndex = 0;

            // if current fragment starts new word
            // Note: doesn't skip more than one word at a time and starts
            // at the beginning of the next word, no matter the step value
            if ( fragi >= pst.fragments.length ) {

                // Have to see if we were already at the last word when we
                // crossed the word boundry
                var progressBefore = pst.getProgress();

                pst.rawWord = pst._stepWord( pst.index + 1 );

                // At very end, go to last fragment
                if ( progressBefore === 1 ) {
                    // Since we were already in the last word, we have the right fragments
                    returnIndex = pst.fragments.length - 1;
                    // If maxChars changed, this will be changed into 0 anyway, so
                    // no worries about wrong indexes because of that change
                }
            
            } else if (fragi < 0) {
                pst.rawWord = pst._stepWord( pst.index - 1 );

            } else {
                // Don't change index or current word, just current fragment position
                // The only place where pos[2] doesn't end up at 0
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

        var getStateProp = function ( propName ) {
        /* ( str ) -> Various
        * 
        * Either get a property from pst._state, return a default
        * value, or throw an error.
        */
            var val = null;

            if ( pst._state ) {
                var funcName = '_getValid_' + propName;
                val = pst[ funcName ]( pst._state[ propName ] );
            } else {
                val = defaults[ propName ];
            }

            return val;
        };  // End getStateProp()


        // ---- Non-splitter values ----
        pst._getValid_minLengthForSeparator = function ( arg ) {
        /* ( int ) -> True or throw error
        * 
        * Will throw necessary errors for bad references or things that
        * aren't ints or arrays of ints. Otherwise, will return `true`
        */
            var msg = 'Was expecting an array of integers. Recieved: ' + arg + ', an ' + Object.prototype.toString.call( arg );

            if ( arg === undefined ) { return defaults.minLengthForSeparator; }
            if ( !isInt( arg ) ) { throw new TypeError( msg ) }

            // Otherwise, we're cool
            return arg;
        };  // End pst._getValid_minLengthForSeparator()

        // ---- Splitter values ----
        // All defaults are valid values for the splitter
        // Otherwise, invalid values will be handled by the splitter
        pst._getValid_maxNumCharacters = function ( val ) { return val || defaults.maxNumCharacters; }
        pst._getValid_redistribute = function ( val ) { return val || defaults.redistribute; }
        pst._getValid_fractionOfMax = function ( val ) { return val || defaults.fractionOfMax; }
        pst._getValid_separator = function ( val ) {
            if ( val == '' ) { return val }
            else { return val || defaults.separator; }
        }


        var notArrayOfArraysOfStringsErrors = function ( arg ) {
        /* ( [[str]] ) -> True or throw error
        * 
        * Will throw necessary errors for bad references or things that
        * aren't arrays of arrays of strings. Otherwise, will return `true`
        */
            var msg = 'Was expecting an array of array of strings. Recieved: ' + arg + ', an ' + Object.prototype.toString.call( arg );

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
        };  // End notArrayOfArraysOfStringsErrors()


        var notArrayOfIntsOrIntErrors = function ( arg ) {
        /* ( int || [ int ] ) -> True or throw error
        * 
        * Will throw necessary errors for bad references or things that
        * aren't ints or arrays of ints. Otherwise, will return `true`
        */
            var msg = 'Was expecting an array of integers. Recieved: ' + arg + ', an ' + Object.prototype.toString.call( arg );

            // Can be positive or negative
            if ( isInt( arg ) ) { return true; }  // Can be an index position

            // Otherwise must be an array of ints
            if ( arg === undefined ) { throw new ReferenceError( msg ) }

            try { arg[0] } catch (err) { throw new TypeError( msg ) }

            // Otherwise, things like `true` pass. Can't just if( arg[0] )
            // because then [0, 0, 0] wouldn't get through
            if ( !isInt( arg[0] ) ) { throw new TypeError( msg ) }

            for (var itemi = 0; itemi < arg.length; itemi++) {
                if ( !isInt( arg[ itemi ] ) ) {
                    throw new TypeError( msg )
                }  // Throw error
            }
            // Otherwise, we're cool
            return true;
        };  // End notArrayOfIntsOrIntErrors()



        // =====================================
        // INITIALIZE
        // =====================================
        pst.init = function ( state ) {
        /* ( {} ) -> ProseStepper
        * 
        * Now that functions exist, use them to check and set
        * values
        */
            pst._split = split;  // func

            pst._state       = state;
            pst._oldMaxChars = getStateProp( 'maxNumCharacters' );
            pst._minLengthForSeparator = getStateProp( 'minLengthForSeparator' );

            pst._progress   = 0;
            sentences       = pst._sentences = null;
            positions       = pst._positions = [];

            return pst;
        };  // End pst.init()



        // =====================================
        // DONE
        // =====================================

        pst.init( state );
        return pst;
    };  // End ProseStepper() -> {}

    return ProseStepper;
}));
