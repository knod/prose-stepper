
var ProseStepper = require('../dist/prose-stepper.js');


/* Notes:
* - To fully test retention of position once a position has been set,
* the 'current position' test needs to be run after every test. There
* are a few tests explicitly for retention, but otherwise, they are
* at the end of every other relevant test.
* - Any problems with `splitterOptions`, the third argument, will be
* handled by the splitter (in this case, hyphenaxe).
*/


describe("When a ProseStepper instance", function () {

	var sentences = [
		['Victorious,', 'you', 'brave', 'flag.'], 
		['Delirious,', 'I', 'come', 'back.'], 
		['\n'], 
		['Why,', 'oh', 'walrus?']
	];

	var ps, state;

	beforeEach( function () {
		state 	  = { maxNumCharacters: 5 };
		ps 		  = new ProseStepper( state );
	})

	// ==== EXPECTED INPUT ====
	describe("is given an array of arrays of strings and a positive integer", function () {

		beforeEach( function () {
			ps.process( sentences );
		});

		// --- Defaults ---
		describe("and formed with no state object values", function () {
			
			beforeEach( function () {
				ps = new ProseStepper();
				ps.process( sentences );
			});

			it("should use its defaults", function () {
				expect( ps.getFragment( [0, 0, 0] )).toEqual( 'Victorious,');
			});

			describe("and then `.setState()` is used to reference an object", function () {

				it("should save and use the new state object.", function () {
					var newState = { maxNumCharacters: 5 };
					ps.setState( newState );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( 'Vict-');
					expect( ps._state ).toBe( newState );
				});

			});

		});


		// --- Current ---
		describe("and asked for the current fragment without any stepping", function () {
			
			it("should give the 1st fragment", function () { expect( ps.getFragment( [0, 0, 0] )).toEqual( 'Vict-') } );

		});


		// --- Reset ---
		describe("and is manipulated in any way,", function () {
			
			it("`.restart()` should start from the beginning again.", function () {
				ps.getFragment( [0, 1, 0] );
				ps.getFragment( [0, 1, 0] );
				ps.getFragment( [0, 1, 0] );
				ps.restart();
				expect( ps.getFragment( [0, 0, 0] )).toEqual( 'Vict-' );
			});

		});


		// --- Forward ---
		describe("and stepped forward (1st non-zero integer found is the one that counts)", function () {

			// --- Sentences ---
			describe("1 sentence", function () {

				it("at the very last sentence, it should return the last word in the last sentence.", function () {
					var result = 'walr-';
					ps.getFragment( [3, 0, 0] );
					expect( ps.getFragment( [1, 0, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

				// sentence boundry
				it("should give the 1st fragment of the next sentence.", function () {
					var result = 'Del-';
					expect( ps.getFragment( [1, 0, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment of the next sentence, no matter what later integers are provided.", function () {
					var result = 'Del-';
					expect( ps.getFragment( [1, 1, 0] )).toEqual( result );  // same as [1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [1, 0, 1] )).toEqual( result );  // same as [1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [1, 2, 0] )).toEqual( result );  // same as [1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [1, 0, 2] )).toEqual( result );  // same as [1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [1, -1, 0] )).toEqual( result );  // same as [1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [1, 0, -1] )).toEqual( result );  // same as [1, 0,  0]
				});

				describe("and then asked for the current fragment", function () {
					// Explicit retention tests
					it("should retain the mid-text sentence position.", function () {
						var frag1 = ps.getFragment( [1, 0, 0] )
						expect( ps.getFragment( [0, 0, 0] )).toEqual( frag1 )
					});

				});

			});  // End 1 sentence

			describe("3 sentences", function () {

				it("at the very last sentence, it should return the last word in the last sentence.", function () {
					var result = 'walr-';
					ps.getFragment( [3, 0, 0] );
					expect( ps.getFragment( [3, 0, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

				// sentence boundry
				it("should give the 1st fragment 3 sentence forward.", function () {
					var result = 'Why,';
					expect( ps.getFragment( [3, 0, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 3 sentence forward, no matter what later integers are provided.", function () {
					var result = 'Why,';
					expect( ps.getFragment( [3, 1, 0] )).toEqual( result );  // same as [3, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 1] )).toEqual( result );  // same as [3, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 2, 0] )).toEqual( result );  // same as [3, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 2] )).toEqual( result );  // same as [3, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, -1, 0] )).toEqual( result );  // same as [3, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, -1] )).toEqual( result );  // same as [3, 0,  0]
				});

			});  // End 3 sentences

			describe("more sentences than exist", function () {

				// TODO: Discuss behavior - should return the last fragment in the last word?
				it("it should return the 1st fragment in the last word in the last sentence.", function () {
					var result = 'walr-';
					expect( ps.getFragment( [5, 0, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});


			// --- Words ---
			describe("1 word", function () {

				it("at the very last word, it should return the last word in the last sentence.", function () {
					var result = 'walr-';
					expect( ps.getFragment( [4, 0, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 1, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

				// word boundry
				it("should give the 1st fragment from 1 word forward.", function () {
					var result = 'you';
					expect( ps.getFragment( [0, 1, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment from 1 word forward, no matter what later integers are provided.", function () {
					var result = 'you';
					expect( ps.getFragment( [0, 1, 1] )).toEqual( result );  // same as [0, 1,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 2] )).toEqual( result );  // same as [0, 1,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, -1] )).toEqual( result );  // same as [0, 1,  0]
				});

				// sentence boundry
				describe("past the last word in the current sentence,", function () {
					
					it("it should give the 1st fragment 1 sentence forward.", function () {
						var result = 'Del-';
						ps.getFragment( [0, 3, 0] )
						expect( ps.getFragment( [0, 1, 0] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});
					
					it("it should give the 1st fragment 1 sentence forward, no matter what later integers are provided.", function () {
						ps.getFragment( [0, 3, 0] )
						expect( ps.getFragment( [0, 1, -1] )).toEqual( 'Del-' );
					});

				});

				describe("and then asked for the current fragment", function () {
					
					it("should retain the mid-sentence position.", function () {
						var frag1 = ps.getFragment( [0, 1, 0] )
						expect( ps.getFragment( [0, 0, 0] )).toEqual( frag1 )
					});

				});

			});  // End 1 word


			describe("2 words", function () {

				it("at the very last word, it should return the last word in the last sentence.", function () {
					var result = 'walr-';
					expect( ps.getFragment( [4, 0, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 2, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

				// word boundry
				it("should give the 1st fragment from 2 words forward.", function () {
					var result = 'brave';
					expect( ps.getFragment( [0, 2, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment from 2 words forward, no matter what later integers are provided.", function () {
					var result = 'brave';
					expect( ps.getFragment( [0, 2, 1] )).toEqual( result );  // same as [0, 2,  0]
					ps.restart();
					expect( ps.getFragment( [0, 2, 2] )).toEqual( result );  // same as [0, 2,  0]
					ps.restart();
					expect( ps.getFragment( [0, 2, -1] )).toEqual( result );  // same as [0, 2,  0]
				});

				// sentence boundry
				it("past the last word in the current sentence, it should give the 1st fragment from the 2nd word, 1 sentence forward.", function () {
					var result = 'I';
					ps.getFragment( [0, 3, 0] );
					expect( ps.getFragment( [0, 2, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("past the last word in the current sentence, it should give the 1st fragment from the 2nd word, 1 sentence forward, no matter what later integers are provided.", function () {
					var result = 'I';
					ps.getFragment( [0, 3, 0] );
					expect( ps.getFragment( [0, 2, -1] )).toEqual( result );  // same as [0, 2,  0]
				});

			});  // End 2 words

			describe("more words than exist", function () {

				// TODO: Discuss behavior - should return the last fragment in the last word?
				it("should return the 1st fragment in the last word in the last sentence.", function () {
					var result = 'walr-';
					expect( ps.getFragment( [0, 100, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});

			// --- Fragments ---
			describe("1 fragment", function () {

				describe("at the very last fragment,", function () {

					it("should return the last fragment in the last word in the last sentence.", function () {
						var result = 'us?';
						expect( ps.getFragment( [4, 0, 0] )).toEqual( 'walr-' );
						expect( ps.getFragment( [0, 0, 1] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});

					describe("and then asked for the current fragment", function () {

						it("should retain a the position at the last fragment.", function () {
							ps.getFragment( [4, 0, 0] )
							var frag1 = ps.getFragment( [0, 0, 1] )
							expect( ps.getFragment( [0, 0, 0] )).toEqual( frag1 )
						});

					});

				});


				describe("should give the next fragment", function () {
		
					it("- the 2nd fragment when at the start of a 3 fragment word.", function () {
						var result = 'orio-';
						expect( ps.getFragment( [0, 0, 0] )).toEqual( 'Vict-' );
						expect( ps.getFragment( [0, 0, 1] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});
		
					it("- the 3rd fragment when in the 2nd fragment of a 3 fragment word.", function () {
						var result = 'us,';
						expect( ps.getFragment( [0, 0, 1] )).toEqual( 'orio-' );
						expect( ps.getFragment( [0, 0, 1] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});

					describe("and then, asked for the current fragment,", function () {

						it("should retain the mid-word fragment position (the 2nd fragment when at the start of a 3 fragment word).", function () {
							var frag1 = ps.getFragment( [0, 0, 1] )
							expect( ps.getFragment( [0, 0, 0] )).toEqual( frag1 )
						});

						it("should retain the mid-word fragment position (the 3rd fragment when in the 2nd fragment of a 3 fragment word).", function () {
							ps.getFragment( [0, 0, 1] )
							var frag1 = ps.getFragment( [0, 0, 1] )
							expect( ps.getFragment( [0, 0, 0] )).toEqual( frag1 )
						});

					});

				});  // End multi-fragment stepping
	
				describe("past the last fragment in the current word,", function () {

					it("it should give the 1st fragment 1 word forward.", function () {
						var result = 'you';
						ps.getFragment( [0, 0, 2] );
						expect( ps.getFragment( [0, 0, 1] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});

				});
				
				describe("past the last fragment in the current sentence,.", function () {
					
					it("it should give the 1st fragment 1 sentence forward.", function () {
						var result = 'Del-';
						expect( ps.getFragment( [0, 3, 0] )).toEqual( 'flag.' );
						expect( ps.getFragment( [0, 0, 1] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});

				});
				
				describe("into the last word,", function () {
					
					it("it should give the 1st fragment last word.", function () {
						var result = 'walr-';
						expect( ps.getFragment( [4, 0, 0] )).toEqual( result );
						expect( ps.getFragment( [0, 0, -1] )).toEqual( 'oh' );
						expect( ps.getFragment( [0, 0, 1] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});

				});
				
				describe("past the last word just as `.maxNumCharacters` changes,", function () {
					
					it("it should give the last fragment last word.", function () {
						var result = 'walrus?';
						expect( ps.getFragment( [4, 0, 0] )).toEqual( 'walr-' );
						expect( ps.getFragment( [0, 0, -1] )).toEqual( 'oh' );
						state.maxNumCharacters = 20;
						expect( ps.getFragment( [0, 0, 1] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});

				});

			});  // End 1 fragment

			describe("2 fragments", function () {

				describe("at the very last fragment,", function () {

					// TODO: Desired behavior? Elsewhere, we get the first fragment in the
					// next word. On the last word, which fragment do we want?
					it("it should return the last fragment in the last word in the last sentence.", function () {
						var result = 'us?';
						expect( ps.getFragment( [4, 0, 0] )).toEqual( 'walr-' );
						expect( ps.getFragment( [0, 0, 2] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});

				});
	
				it("should give the fragment 2 fragments forward from this one.", function () {
					var result = 'us,';
					expect( ps.getFragment( [0, 0, 2] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("or more past the last fragment in the current word, it should give the 1st fragment 1 word forward.", function () {
					var result = 'you';
					expect( ps.getFragment( [0, 0, 6] )).toEqual( result );  // ??: Should this be the behavior? What should it be?
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("past the last fragment in the current sentence, it should give the 1st fragment 1 sentence forward.", function () {
					var result = 'Del-';
					ps.getFragment( [0, 2, 0] );
					expect( ps.getFragment( [0, 0, 1] )).toEqual( 'flag.' );
					expect( ps.getFragment( [0, 0, 6] )).toEqual( result );  // ??: Should this be the behavior? What should it b e?
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});  // End 2 fragments

		});  // End forward


		// --- Backward ---
		describe("and stepped backward (1st non-zero integer found is the one that counts)", function () {
			
			// --- Sentences ---
			describe("1 sentence", function () {

				it("at the very 1st sentence, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [-1, 0, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment of the previous sentence.", function () {
					var result = '\n';
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [-1, 0, 0] )).toEqual( result );  // same as [-1, 0,  0]
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment of the previous sentence, no matter what later integers are provided.", function () {
					var result = '\n';
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [-1, 2, 0] )).toEqual( result );  // same as [-1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [-1, 0, 2] )).toEqual( result );  // same as [-1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [-1, -1, 0] )).toEqual( result );  // same as [-1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [-1, 0, -1] )).toEqual( result );  // same as [-1, 0,  0]
				});

			});

			describe("2 sentences", function () {

				it("at the very 1st sentence, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [-2, 0, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 2 sentence backward.", function () {
					var result = 'Del-';
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [-2, 0, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 2 sentence backward, no matter what later integers are provided.", function () {
					var result = 'Del-';
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [-2, 2, 0] )).toEqual( result );  // same as [-2, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [-2, 0, 2] )).toEqual( result );  // same as [-2, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [-2, -1, 0] )).toEqual( result );  // same as [-2, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [-2, 0, -1] )).toEqual( result );  // same as [-2, 0,  0]
				});

			});

			// --- Words ---
			describe("1 word", function () {

				it("at the very 1st word, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, -1, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 1 word backward.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 1, 0] )).toEqual( 'you' );
					expect( ps.getFragment( [0, -1, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 1 word backward, no matter what later integers are provided.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 1, 0] )).toEqual( 'you' );
					expect( ps.getFragment( [0, -1, 1] )).toEqual( result );  // same as [0, -1,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0] )).toEqual( 'you' );
					expect( ps.getFragment( [0, -1, 2] )).toEqual( result );  // same as [0, -1,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0] )).toEqual( 'you' );
					expect( ps.getFragment( [0, -1, -1] )).toEqual( result );  // same as [0, -1,  0]
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 1 word backward, crossing sentence boundries.", function () {
					var result = '\n';
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -1, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 1 word backward, crossing sentence boundries, no matter what later integers are provided.", function () {
					var result = '\n';
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -1, 1] )).toEqual( result );  // same as [0, -1,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -1, 2] )).toEqual( result );  // same as [0, -1,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -1, -1] )).toEqual( result );  // same as [0, -1,  0]
				});

			});

			describe("2 words", function () {

				it("at the very 1st word, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, -2, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 2 words backward.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 2, 0] )).toEqual( 'brave' );
					expect( ps.getFragment( [0, -2, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 2 words backward, no matter what later integers are provided.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 1, 0] )).toEqual( 'you' );
					expect( ps.getFragment( [0, -2, 1] )).toEqual( result );  // same as [0, -2,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0] )).toEqual( 'you' );
					expect( ps.getFragment( [0, -2, 2] )).toEqual( result );  // same as [0, -2,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0] )).toEqual( 'you' );
					expect( ps.getFragment( [0, -2, -1] )).toEqual( result );  // same as [0, -2,  0]
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 2 words backward, crossing sentence boundries.", function () {
					var result = 'back.';
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -2, 0] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 2 words backward, crossing sentence boundries, no matter what later integers are provided.", function () {
					var result = 'back.';
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -2, 1] )).toEqual( result );  // same as [0, -2,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -2, 2] )).toEqual( result );  // same as [0, -2,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0] )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -2, -1] )).toEqual( result );  // same as [0, -2,  0]
				});

			});

			// --- Fragments ---
			describe("1 fragment", function () {

				it("at the very 1st fragment of the 1st word, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 0, -1] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				describe("should give the previous fragment", function () {
		
					it("- the 1st fragment when in the 2nd fragment of a three fragment word.", function () {
						var result = 'Vict-';
						expect( ps.getFragment( [0, 0, 1] )).toEqual( 'orio-' );
						expect( ps.getFragment( [0, 0, -1] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});
					
					it("- the 2nd fragment when in the 3rd fragment of a three fragment word.", function () {
						var result = 'orio-';
						expect( ps.getFragment( [0, 0, 2] )).toEqual( 'us,' );
						expect( ps.getFragment( [0, 0, -1] )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
					});
				});
				
				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 1, 0] )).toEqual( 'you' );
					expect( ps.getFragment( [0, 0, -1] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward, not just always go to the start of the sentence.", function () {
					var result = 'you';
					expect( ps.getFragment( [0, 2, 0] )).toEqual( 'brave' );
					expect( ps.getFragment( [0, 0, -1] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

				it("before the 1st fragment in the current sentence, it should give the 1st fragment of the last word 1 sentence backward.", function () {
					var result = 'flag.';
					expect( ps.getFragment( [1, 0, 0] )).toEqual( 'Del-' );
					expect( ps.getFragment( [0, 0, -1] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});

			// Going back multiple fragments is only different within one word with multiple fragments
			describe("2 fragments", function () {

				it("at the very 1st fragment of the 1st word, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 0, -2] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

				it("while at the 3rd fragment, should give the 1st fragment.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 0, 2] )).toEqual( 'us,' );
					expect( ps.getFragment( [0, 0, -2] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

				// TODO: Change this to something not crossing sentence boundries?
				it("while at the 2nd fragment, should give the 1st fragment 1 word backward.", function () {
					var result = 'flag.';
					expect( ps.getFragment( [1, 0, 0] )).toEqual( 'Del-' );
					expect( ps.getFragment( [0, 0, 1] )).toEqual( 'irio-' );
					expect( ps.getFragment( [0, 0, -2] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

				// TODO: Change this to something not crossing sentence boundries?
				it("while at the 1nd fragment in the array as a whole, should give the 1st fragment, not attempting to travel out of the array.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 0, -2] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 1, 0] )).toEqual( 'you' );
					expect( ps.getFragment( [0, 0, -2] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward, not just always go to the start of the sentence.", function () {
					var result = 'you';
					expect( ps.getFragment( [0, 2, 0] )).toEqual( 'brave' );
					expect( ps.getFragment( [0, 0, -2] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

				it("before the 1st fragment in the current sentence, it should give the 1st fragment 1 sentence backward.", function () {
					var result = 'flag.';
					expect( ps.getFragment( [1, 0, 0] )).toEqual( 'Del-' );
					expect( ps.getFragment( [0, 0, -2] )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});

		});  // End backward


		// --- Index ---
		describe("and given an index position", function () {
			
			describe("of -1 should get the last word", function () {
				
				it("when starting at the start of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 0 ) ).toEqual( 'Vict-' );
					expect( ps.getFragment( -1 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("when starting at the middle of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 5 ) ).toEqual( 'I' );
					expect( ps.getFragment( -1 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("when starting at the end of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 11 ) ).toEqual( result );
					expect( ps.getFragment( -1 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});
			
			describe("of -2 should get the second to last word", function () {
				
				it("when starting at the start of the collection.", function () {
					var result = 'oh';
					expect( ps.getFragment( 0 ) ).toEqual( 'Vict-' );
					expect( ps.getFragment( -2 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("when starting at the middle of the collection.", function () {
					var result = 'oh';
					expect( ps.getFragment( 5 ) ).toEqual( 'I' );
					expect( ps.getFragment( -2 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				
				it("when starting at the end of the collection.", function () {
					var result = 'oh';
					expect( ps.getFragment( 11 ) ).toEqual( 'walr-' );
					expect( ps.getFragment( -2 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});
			
			describe("of 0 should get the 1st word", function () {
				
				it("even when starting at the start of the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( 0 ) ).toEqual( 'Vict-' );
					expect( ps.getFragment( 0 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				it("when starting at the middle of the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( 5 ) ).toEqual( 'I' );
					expect( ps.getFragment( 0 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				it("when starting at the end of the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( 11 ) ).toEqual( 'walr-' );
					expect( ps.getFragment( 0 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});
			
			describe("of 5 should get the 6th word", function () {
				
				it("when starting at the start of the collection.", function () {
					var result = 'I';
					expect( ps.getFragment( 0 ) ).toEqual( 'Vict-' );
					expect( ps.getFragment( 5 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				it("when starting at the middle of the collection.", function () {
					var result = 'I';
					expect( ps.getFragment( 5 ) ).toEqual( 'I' );
					expect( ps.getFragment( 5 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				it("when starting at the end of the collection.", function () {
					var result = 'I';
					expect( ps.getFragment( 11 ) ).toEqual( 'walr-' );
					expect( ps.getFragment( 5 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});
			
			describe("of 11, in the 12 word collection, should get the 12th word", function () {
				
				it("when starting at the start of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 0 ) ).toEqual( 'Vict-' );
					expect( ps.getFragment( 11 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				it("when starting at the middle of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 5 ) ).toEqual( 'I' );
					expect( ps.getFragment( 11 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});
				it("even when starting at the end of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 11 ) ).toEqual( 'walr-' );
					expect( ps.getFragment( 11 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});

			// TODO: Discuss behavior - Jump past end, back at start? Error? Undefined...? last word? last fragment?
			describe("of 100, in the 12 word collection, should get the 12th word", function () {
				
				it("when starting at the start of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 0 ) ).toEqual( 'Vict-' );
					expect( ps.getFragment( 100 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0] )).toEqual( result );  // retain position
				});

			});

		});  // End call `.getFragment()` using an index number


		// --- Getters ---
		describe("and the number of strings in the array is 12", function () {

			describe("should return progress as a fraction based on: current word (not fragment) number / number of total words.", function () {

				it("It should be [1/4, 1/4, 1/3] on the 1st fragment.", function () {
					ps.getFragment( [0, 0, 0] );
					expect( ps.getRelativeProgress() ).toEqual( [1/4, 1/4, 1/3] );
				});

				it("It should be [1/4, 1/4, 2/3] on the 2nd fragment.", function () {
					ps.getFragment( [0, 0, 0] );
					ps.getFragment( [0, 0, 1] );
					expect( ps.getRelativeProgress() ).toEqual( [1/4, 1/4, 2/3] );
				});

				it("It should be [1/4, 1/4, 1] on the 1st word, last fragment.", function () {
					ps.getFragment( [0, 0, 0] );
					ps.getFragment( [0, 0, 1] );
					ps.getFragment( [0, 0, 1] );
					expect( ps.getRelativeProgress() ).toEqual( [1/4, 1/4, 1] );
				});

				it("It should be [1/4, 1, 1] on the 2nd word, 1st fragment.", function () {
					ps.getFragment( [0, 1, 0] );
					// expect( ps.getRelativeProgress() ).toEqual( 1/11 );
					// expect( ps.getRelativeProgress() ).toEqual( [0, 0, 1] );
					expect( ps.getRelativeProgress() ).toEqual( [1/4, 1, 1] );
				});

				it("It should be [2/4, 1/4, 1/3] on the 5th word, 1st fragment, when moved forward a sentence.", function () {
					ps.getFragment( [1, 0, 0] );
					// expect( ps.getRelativeProgress() ).toEqual( 4/11 );
					// expect( ps.getRelativeProgress() ).toEqual( [1/3, 0, 0/2] );
					expect( ps.getRelativeProgress() ).toEqual( [2/4, 1/4, 1/3] );
				});

				it("It should be [1, 1, 1] on the last fragment.", function () {
					ps.getFragment( [5, 0, 0] );
					ps.getFragment( [0, 0, 100] );
					// expect( ps.getRelativeProgress() ).toEqual( 1 );
					expect( ps.getRelativeProgress() ).toEqual( [1, 1, 1] );
				});

			});  // End .getRelativeProgress()

			describe("should return progress as a fraction based on: current word (not fragment) number / number of total words.", function () {

				it("It should be 0 on the 1st word.", function () {
					ps.getFragment( [0, 0, 0] );
					expect( ps.getProgress() ).toEqual( 0/11 );
					ps.getFragment( [0, 0, 1] );
					expect( ps.getProgress() ).toEqual( 0/11 );
					ps.getFragment( [0, 0, 1] );
					expect( ps.getProgress() ).toEqual( 0/11 );
				});

				it("It should be 1/11 on the 2nd word.", function () {
					ps.getFragment( [0, 1, 0] );
					expect( ps.getProgress() ).toEqual( 0/11 );
				});

				it("It should be 4/11 on the 5th word, when moved forward a sentence.", function () {
					ps.getFragment( [1, 0, 0] );
					expect( ps.getProgress() ).toEqual( 4/11 );
				});

				it("It should be 1 on the 12th word.", function () {
					ps.getFragment( [5, 0, 0] );
					ps.getFragment( [0, 0, 100] );
					expect( ps.getProgress() ).toEqual( 1 );
				});

			});  // End .getProgress()

			describe("should return 'index' as an integer based on current word (not fragment) as if it were in an array of words/strings.", function () {

				it("It should be 0 on the 1st word.", function () {
					ps.getFragment( [0, 0, 0] );
					expect( ps.getIndex() ).toEqual( 0 );
					ps.getFragment( [0, 0, 1] );
					expect( ps.getIndex() ).toEqual( 0 );
					ps.getFragment( [0, 0, 1] );
					expect( ps.getIndex() ).toEqual( 0 );
				});

				it("It should be 1 on the 2nd word.", function () {
					ps.getFragment( [0, 1, 0] );
					expect( ps.getIndex() ).toEqual( 1);
				});

				it("It should be 4 on the 5th word, when moved forward a sentence.", function () {
					ps.getFragment( [1, 0, 0] );
					expect( ps.getIndex() ).toEqual( 4 );
				});

				it("It should be 11 on the 12th word.", function () {
					ps.getFragment( [5, 0, 0] );
					expect( ps.getIndex() ).toEqual( 11 );
				});

			});

			it("should return 'length' as an integer as if the array were in an array of words/strings.", function () {
				expect( ps.getLength() ).toEqual( 12 );
			});

		});  // End `.get` progress, index, and length for length 12 collection


		// --- `state` ---
		describe("and, mid-multi-fragment-word, a `state` property values is changed,", function () {

			it("`.separator`, it should restart the word, getting the first fragment.", function () {
				expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
				state.separator = '%%%%';
				expect( ps.getFragment( [0, 0, 1] )).toEqual('V%%%%');
			});

			it("`.minLengthForSeparator`, it should restart the word, getting the first fragment.", function () {
				expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
				state.minLengthForSeparator = 8;
				expect( ps.getFragment( [0, 0, 1] )).toEqual('Vict');
			});

			it("`.fractionOfMax`, it should restart the word, getting the first fragment.", function () {
				expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
				state.fractionOfMax = 1;
				expect( ps.getFragment( [0, 0, 1] )).toEqual('Vic-');
			});

			it("`.maxNumCharacters`, it should restart the word, getting the first fragment.", function () {
				expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
				state.maxNumCharacters = 3;
				expect( ps.getFragment( [0, 0, 1] )).toEqual('Vi-');
			});

			// TODO: test `.redistribute` too

		});  // End mid-multi-fragment-word state change


		// --- Default `state.maxNumCharacters` ---
		describe("and its maximum characters is changed to something less than 3", function () {

			it("because of it's `._minLengthForSeparator` it should not include a hyphen in the result.", function () {
				state.maxNumCharacters = 2;
				expect( ps.getFragment( [0, 0, 0] )).toEqual('Vi');
				expect( ps.getFragment( [0, 0, 1] )).toEqual('ct');
			});

		});


		// --- Custom `state.minLengthForSeparator` ---
		describe("and its `state`s `.minLengthForSeparator` is changed to", function () {

			describe("something more than the number of `._maxChars`", function () {

				it("it should not include a hyphen/separator in the result.", function () {
					state.minLengthForSeparator = 8;
					// It's not split evenly because there's a comma at the end
					expect( ps.getFragment( [0, 0, 0] )).toEqual('Vict');
					expect( ps.getFragment( [0, 0, 1] )).toEqual('orio');
				});

			});

			// Values less than 3 won't throw errors, but they also
			// won't change output. It would mean that only
			// fragments of length 1 would not have hyphens and
			// they don't have hyphens anyway.
			describe("less than 3", function () {

				it("it should behave as normal.", function () {
					state.minLengthForSeparator = 2;
					expect( ps.getFragment( [0, 0, 0] )).toEqual('Vict-');
					expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
				});

				it("it should behave as normal.", function () {
					state.minLengthForSeparator = 1;
					expect( ps.getFragment( [0, 0, 0] )).toEqual('Vict-');
					expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
				});

				it("it should behave as normal.", function () {
					state.minLengthForSeparator = 0;
					expect( ps.getFragment( [0, 0, 0] )).toEqual('Vict-');
					expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
				});

				it("it should behave as normal.", function () {
					state.minLengthForSeparator = -1;
					expect( ps.getFragment( [0, 0, 0] )).toEqual('Vict-');
					expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
				});

			});

		});  // End Custom `state.minLengthForSeparator`

		describe("and a new `state` is set with `.setState()`", function () {

			it("it should start at the beginning of the current word and use the new state object.", function () {
				expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
				var newState = { maxNumCharacters: 8 }
				ps.setState( newState );
				expect( ps.getFragment( [0, 0, 1] )).toEqual('Victo-');
			});

		});

	});  // End expected values


	// ==== UNEXPECTED VALUES, CUSTOM ERROR MESSAGES ====
	// "When a ProseStepper instance"
	describe("gets unexpected values", function () {

		// Takes: [[str]], int. Can't allow placeholder value - `.positions` can't be created properly otherwise
		describe("for `.process()`,", function () {

			// No processing before each

			describe("the 1st argument is undefined,", function () {

				it("it should throw an REFERENCE error", function () {
					expect( function () { ps.process(); }).toThrowError( ReferenceError, /Was expecting/ );
				});

			});

			describe("the 1st argument is not an array of arrays of strings,", function () {

				describe("it's not an array at all,", function () {

					it("(null) it should throw a TYPE error", function () {
						expect( function () { ps.process( null ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(true) it should throw a TYPE error", function () {
						expect( function () { ps.process( true ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(false) it should throw a TYPE error", function () {
						expect( function () { ps.process( false ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(NaN) it should throw a TYPE error", function () {
						expect( function () { ps.process( NaN ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(0) it should throw a TYPE error", function () {
						expect( function () { ps.process( 0 ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(1) it should throw a TYPE error", function () {
						expect( function () { ps.process( 1 ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(number) it should throw a TYPE error", function () {
						expect( function () { ps.process( 2 ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(string) it should throw a TYPE error", function () {
						expect( function () { ps.process( 'test' ); }).toThrowError( TypeError, /Was expecting/ );
					});

				});  // === other

				describe("it's an array of something else,", function () {

					it("([]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([null, null]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [null, null] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([true]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [true] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([false]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [false] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([NaN]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [NaN] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([{}]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [{}] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([0]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([1]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [1] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([number]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [2] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([string]) it should throw a TYPE error", function () {
						expect( function () { ps.process( ['test'] ); }).toThrowError( TypeError, /Was expecting/ );
					});

				});  // === [other]

				describe("it's an array of arrays of something else,", function () {

					it("([[]]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [[]] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([[null, null]]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [[null, null]] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([[true]]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [[true]] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([[false]]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [[false]] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([[NaN]]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [[NaN]] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([[{}]]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [[{}]] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([[0]]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [[0]] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([[1]]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [[1]] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([[2]]) it should throw a TYPE error", function () {
						expect( function () { ps.process( [[2]] ); }).toThrowError( TypeError, /Was expecting/ );
					});

				});  // === [[other]]

			});  // !== [[str]]

		});  // End .process()

		// --- ``.getFragment()`` ---
		// Takes: [int, int, int]
		describe("for `.getFragment()`,", function () {


			beforeEach( function () {
				ps.process( sentences );
			});

			describe("the 1st argument is undefined,", function () {

				it("it should throw an REFERENCE error", function () {
					expect( function () { ps.getFragment(); }).toThrowError( ReferenceError, /Was expecting/ );
				});

			});

			describe("the 1st argument is not array,", function () {

				it("(null) it should throw a TYPE error", function () {
					expect( function () { ps.getFragment( null ); }).toThrowError( TypeError, /Was expecting/ );
				});

				it("(true) it should throw a TYPE error", function () {
					expect( function () { ps.getFragment( true ); }).toThrowError( TypeError, /Was expecting/ );
				});

				it("(false) it should throw a TYPE error", function () {
					expect( function () { ps.getFragment( false ); }).toThrowError( TypeError, /Was expecting/ );
				});

				it("(NaN) it should throw a TYPE error", function () {
					expect( function () { ps.getFragment( NaN ); }).toThrowError( TypeError, /Was expecting/ );
				});

				it("({}) it should throw a TYPE error", function () {
					expect( function () { ps.getFragment( {} ); }).toThrowError( TypeError, /Was expecting/ );
				});

				it("(1.1) it should throw a TYPE error", function () {
					expect( function () { ps.getFragment( 1.1 ); }).toThrowError( TypeError, /Was expecting/ );
				});

				it("('test') it should throw a TYPE error", function () {
					expect( function () { ps.getFragment( 'test' ); }).toThrowError( TypeError, /Was expecting/ );
				});

			});  // End 1st !== []


			describe("the 1st argument is an array containing non ints", function () {

				describe("in the 1st slot,", function () {

					it("(undefined) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [undefined, 0, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(null) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [null, 0, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(true) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [true, 0, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(false) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [false, 0, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(NaN) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [NaN, 0, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([]) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [[], 0, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("({}) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [{}, 0, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(1.1) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [1.1, 0, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("('test') it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( ['test', 0, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

				});  // End 1st arg === [other, int, int]

				describe("in the 2nd slot,", function () {

					it("(undefined) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, undefined, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(null) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, null, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(true) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, true, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(false) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, false, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(NaN) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, NaN, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([]) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, [], 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("({}) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, {}, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(1.1) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 1.1, 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("('test') it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 'test', 0] ); }).toThrowError( TypeError, /Was expecting/ );
					});

				});  // End 1st arg === [int, other, int]

				describe("in the 3rd slot,", function () {

					it("(undefined) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, undefined] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(null) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, null] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(true) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, true] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(false) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, false] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(NaN) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, NaN] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("([]) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, []] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("({}) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, {}] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("(1.1) it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, 1.1] ); }).toThrowError( TypeError, /Was expecting/ );
					});

					it("('test') it should throw a TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, 'test'] ); }).toThrowError( TypeError, /Was expecting/ );
					});

				});  // End 1st arg === [int, int, other]

			});  // End 1st === [other]

		});  // End .getFragment()


		// --- `state.minLengthForSeparator` ---
		// --- takes undefined or positive int ---
		describe("for its `state`s `.minLengthForSeparator`,", function () {

			var step = [0, 0, 0];

			// undefined or any integer is fine

			it("`null`, it should throw a TYPE error", function () {
				state.minLengthForSeparator = null;
				expect( function () { ps.getFragment( step ); }).toThrowError( TypeError, /Was expecting/ );
			});

			it("`true`, it should throw a TYPE error", function () {
				state.minLengthForSeparator = true;
				expect( function () { ps.getFragment( step ); }).toThrowError( TypeError, /Was expecting/ );
			});

			it("`false`, it should throw a TYPE error.", function () {
				state.minLengthForSeparator = false;
				expect( function () { ps.getFragment( step ); }).toThrowError( TypeError, /Was expecting/ );
			});

			it("`NaN`, it should throw a TYPE error.", function () {
				state.minLengthForSeparator = NaN;
				expect( function () { ps.getFragment( step ); }).toThrowError( TypeError, /Was expecting/ );
			});

			it("`{}`, it should throw a TYPE error", function () {
				state.minLengthForSeparator = {};
				expect( function () { ps.getFragment( step ); }).toThrowError( TypeError, /Was expecting/ );
			});

			it("`[]`, it should throw a TYPE error", function () {
				state.minLengthForSeparator = [];
				expect( function () { ps.getFragment( step ); }).toThrowError( TypeError, /Was expecting/ );
			});

			it("`[5]`, it should throw a TYPE error", function () {
				state.minLengthForSeparator = [5];
				expect( function () { ps.getFragment( step ); }).toThrowError( TypeError, /Was expecting/ );
			});

			it("`1.1`, it should throw a TYPE error", function () {
				state.minLengthForSeparator = 1.1;
				expect( function () { ps.getFragment( step ); }).toThrowError( TypeError, /Was expecting/ );
			});

			it("`'text'`, it should throw a TYPE error", function () {
				state.minLengthForSeparator = 'text';
				expect( function () { ps.getFragment( step ); }).toThrowError( TypeError, /Was expecting/ );
			});

		});  // End invalid `state.minLengthForSeparator`


		// --- `.setState()` ---
		describe("when `.setState()` is used with", function () {

			it("`.minLengthForSeparator` with `null`, it should throw a TYPE error (basically all the same errors incorrect values should throw anytime).", function () {
				var newState = { minLengthForSeparator: null };
				expect( function () { ps.setState( newState ); }).toThrowError( TypeError, /Was expecting/ );
			});

		});

	});  // End Unexpected Values


});  // End ProseStepper
