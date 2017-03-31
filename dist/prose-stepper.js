/* prose-stepper.js
* 
* Step back and forth through sentences and words
* Also splits up the words into fragments if needed?
* 
* 
* TODO:
* - ??: Add stepping for paragraph?
* - Reset values non-destructively
* - When max length changes, caller must step 0 again for no errors.
*   Or something.
* - Module just for navigating within arrays of arrays? (that can
*   be changed?)
* - ??: Allow -1 at the beginning of a sentenceArray to loop around
*   to the end?
* - ??: On child increment, don't just stop at next parent, keep
*   iterating by the given unit
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

        pst.index 		= 0;
        pst.position    = [ 0, 0, 0 ],
        // `pst.currentWord` isn't just a string. It's not from the sentence/word
        // array, it's a word once it has been fragmented into a list of strings
        pst.currentWord = null;  // [ Str ]


		// =====================================
		// INTERNAL
		// =====================================

        pst._split      = split;  // func
        pst._progress 	= 0;
        pst._maxChars   = 0;  // TODO: ??: Default or required argument? Default hides errors?
        var sentences 	= pst._sentences = null;
        var positions 	= pst._positions = [];



		// =====================================
		// SET UP NEW DATA
		// =====================================

       	pst.process = function ( senteceArray, maxChars ) {
       		if ( !senteceArray ) { console.warn('ProseStepper needs dataz to .process(). You gave it dis:', senteceArray); }  // Throw error
            if ( !maxChars ) {}  // Throw error

            pst._maxChars   = maxChars;
            sentences       = pst._sentences = senteceArray;  
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



		// =====================================
		// RUNTIME
		// =====================================
        // Traveling The Words/Sentences (for external use)

        pst.restart = function ( maxChars ) {
            // ??: Return first fragment?
            if ( maxChars ) { pst._maxChars = maxChars; }
            pst.index    = 0;
            pst.position = [ 0, 0, 0 ];
            var rawWord  = pst._stepWord( pst.index );
            pst.currentWord = pst._split( rawWord, pst._maxChars );
            // pst.currentWord = pst._stepWord( pst.index );
            return pst;
        };


        pst.getFragment = function ( changesOrIndex, maxChars ) {
        /* ( [int, int, int] or int ) -> Str
        * 
        * Currently it seems that only one of the ints can be something
        * other than 0.
        * ??: Find cases where that isn't true.
        */
            var frag 	= null,
                pos  	= pst.position,
                rawWord = pst.currentWord;

            if ( maxChars ) { pst._maxChars = maxChars }

            // TODO:
            // If maxNumCharacters changed, re-fragment word and start at
            // the beginning of word

            // if plain index change/jump
            if ( typeof changesOrIndex === 'number' ) {
                rawWord = pst._stepWord( changesOrIndex );
                pos[2]  = 0;

            // !!! CAN ONLY CHANGE ONE POSITION AT A TIME !!! \\

            // if sentence change
            } else if ( changesOrIndex[0] !== 0 ) {

                // find new sentence and get the new index
                var index 	= pst._stepSentence( changesOrIndex[0] );
                rawWord 	= pst._stepWord( index );
                pos[2]      = 0;

            // if word change
            } else if ( changesOrIndex[1] !== 0 ) {

                index       = pst.index + changesOrIndex[1];
                rawWord 	= pst._stepWord( index );
                pos[2]      = 0;

            // if fragment change
            } else if ( changesOrIndex[2] !== 0 ) {  // No provision for backwards fragment travel

                var fragi = pos[2] + changesOrIndex[2];

                // if current fragment starts new word
                // Note: doesn't skip more than one word at a time and starts
                // at the beginning of the next word
                if ( fragi >= rawWord.length ) {
                    rawWord = pst._stepWord( pst.index + 1 );
                    pos[2]  = 0;
                
                } else if (fragi < 0) {
                    // don't change index or current word, just current fragment position
                    rawWord = pst._stepWord( pst.index - 1 );
                    pos[2] 	= 0;

                } else {
                    // don't change index or current word, just current fragment position
                    rawWord = pst._stepWord( pst.index );
                    pos[2]  = fragi;

                }

            // If no change, get whatever's current
            } else {
                rawWord = pst._stepWord( pst.index );
                pos[2]  = 0;
            } // end if index or which position changed

            pst.currentWord  = pst._split( rawWord, pst._maxChars );
            frag             = pst.currentWord[ pos[2] ];

            return frag;
        }  // End pst.getFragment()



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

            return newIndex;
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


        pst._positionToIndex = function ( pos ) {
        /* ( [int, int] ) -> Int
        * 
        * Given a [sentence, word] position, find the index of that
        * configuration in the positions list. If none found, return
        * -1. (There are ways to speed this up if needed, like checking
        * just sentence index first until sentence found, etc).
        * 
        * This is different from ._sentenceChangeToIndex() because this
        * one searches the whole array, it doesn't start from the current
        * position and work in a direction (back of forward) from there.
        * TODO: Performance analysis on long texts
        */
            var index = positions.findIndex( function matchPosToIndex( potential ) {
                var sent = (pos[0] === potential[0]),
                    frag = (pos[1] === potential[1]);
                return sent && frag;
            })
            return index;
        }



		// =====================================
		// UTILITIES
		// =====================================

        var signOf = function ( num ) {
            return typeof num === 'number' ? num ? num < 0 ? -1 : 1 : num === num ? num : NaN : NaN;
        }

        pst.normalizeIndex = function ( index ) {
            index = Math.min( index, positions.length - 1 );  // max
            return Math.max( index, 0 );  // min
        };
        pst.normalizeSentencePos = function ( senti ) {
            senti = Math.min( senti, (sentences.length - 1) );
            return Math.max( senti, 0 );
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


        return pst;
    };  // End ProseStepper() -> {}

    return ProseStepper;
}));
