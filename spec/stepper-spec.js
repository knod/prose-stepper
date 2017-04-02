
var ProseStepper = require('../dist/prose-stepper.js');


describe("When a ProseStepper instance", function () {

	var ps, maxChars, sentences;

	beforeEach( function () {
		ps 		  = new ProseStepper();
		sentences = [  ['Victorious,','you','brave','flag.'], ['Delirious,','I','come','back.'], ['\n'], ['Why,','oh','walrus?'] ];
		maxChars  = 5;
	})

	// ==== EXPECTED INPUT ====
	describe("is given an array of arrays of strings and a positive integer", function () {

		beforeEach( function () {
			ps.process( sentences, maxChars );
		});

		// --- Current ---
		describe("and asked for the current fragment without any stepping", function () {
			
			it("should give the 1st fragment", function () { expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( 'Vict-') } );

		});


		// --- Reset ---
		describe("and is manipulated in any way,", function () {
			
			it("`.restart()` should start from the beginning again.", function () {
				ps.getFragment( [0, 1, 0], maxChars );
				ps.getFragment( [0, 1, 0], maxChars );
				ps.getFragment( [0, 1, 0], maxChars );
				ps.restart();
				expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( 'Vict-' );
			});

		});

		/* Notes:
		* - To fully test retention of position once a position has been set,
		* the 'current position' test needs to be run after every test. There
		* are a few tests explicitly for retention, but otherwise, they are
		* at the end of every other relevant test.
		*/


		// --- Forward ---
		describe("and stepped forward (1st non-zero integer found is the one that counts)", function () {

			// --- Sentences ---
			describe("1 sentence", function () {

				it("at the very last sentence, it should return the last word in the last sentence.", function () {
					var result = 'walr-';
					ps.getFragment( [3, 0, 0], maxChars );
					expect( ps.getFragment( [1, 0, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

				// sentence boundry
				it("should give the 1st fragment of the next sentence.", function () {
					var result = 'Del-';
					expect( ps.getFragment( [1, 0, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment of the next sentence, no matter what later integers are provided.", function () {
					var result = 'Del-';
					expect( ps.getFragment( [1, 1, 0], maxChars )).toEqual( result );  // same as [1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [1, 0, 1], maxChars )).toEqual( result );  // same as [1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [1, 2, 0], maxChars )).toEqual( result );  // same as [1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [1, 0, 2], maxChars )).toEqual( result );  // same as [1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [1, -1, 0], maxChars )).toEqual( result );  // same as [1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [1, 0, -1], maxChars )).toEqual( result );  // same as [1, 0,  0]
				});

				describe("and then asked for the current fragment", function () {
					// Explicit retention tests
					it("should retain the mid-text sentence position.", function () {
						var frag1 = ps.getFragment( [1, 0, 0], maxChars )
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( frag1 )
					});

				});

			});  // End 1 sentence

			describe("3 sentences", function () {

				it("at the very last sentence, it should return the last word in the last sentence.", function () {
					var result = 'walr-';
					ps.getFragment( [3, 0, 0], maxChars );
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

				// sentence boundry
				it("should give the 1st fragment 3 sentence forward.", function () {
					var result = 'Why,';
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 3 sentence forward, no matter what later integers are provided.", function () {
					var result = 'Why,';
					expect( ps.getFragment( [3, 1, 0], maxChars )).toEqual( result );  // same as [3, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 1], maxChars )).toEqual( result );  // same as [3, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 2, 0], maxChars )).toEqual( result );  // same as [3, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 2], maxChars )).toEqual( result );  // same as [3, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, -1, 0], maxChars )).toEqual( result );  // same as [3, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, -1], maxChars )).toEqual( result );  // same as [3, 0,  0]
				});

			});  // End 3 sentences

			describe("more sentences than exist", function () {

				it("it should return the 1st fragment in the last word in the last sentence.", function () {
					var result = 'walr-';
					expect( ps.getFragment( [5, 0, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

			});


			// --- Words ---
			describe("1 word", function () {

				it("at the very last word, it should return the last word in the last sentence.", function () {
					var result = 'walr-';
					expect( ps.getFragment( [4, 0, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

				// word boundry
				it("should give the 1st fragment from 1 word forward.", function () {
					var result = 'you';
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment from 1 word forward, no matter what later integers are provided.", function () {
					var result = 'you';
					expect( ps.getFragment( [0, 1, 1], maxChars )).toEqual( result );  // same as [0, 1,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 2], maxChars )).toEqual( result );  // same as [0, 1,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, -1], maxChars )).toEqual( result );  // same as [0, 1,  0]
				});

				// sentence boundry
				describe("past the last word in the current sentence,", function () {
					
					it("it should give the 1st fragment 1 sentence forward.", function () {
						var result = 'Del-';
						ps.getFragment( [0, 3, 0], maxChars )
						expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
					});
					
					it("it should give the 1st fragment 1 sentence forward, no matter what later integers are provided.", function () {
						ps.getFragment( [0, 3, 0], maxChars )
						expect( ps.getFragment( [0, 1, -1], maxChars )).toEqual( 'Del-' );
					});

				});

				describe("and then asked for the current fragment", function () {
					
					it("should retain the mid-sentence position.", function () {
						var frag1 = ps.getFragment( [0, 1, 0], maxChars )
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( frag1 )
					});

				});

			});  // End 1 word


			describe("2 words", function () {

				it("at the very last word, it should return the last word in the last sentence.", function () {
					var result = 'walr-';
					expect( ps.getFragment( [4, 0, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

				// word boundry
				it("should give the 1st fragment from 2 words forward.", function () {
					var result = 'brave';
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment from 2 words forward, no matter what later integers are provided.", function () {
					var result = 'brave';
					expect( ps.getFragment( [0, 2, 1], maxChars )).toEqual( result );  // same as [0, 2,  0]
					ps.restart();
					expect( ps.getFragment( [0, 2, 2], maxChars )).toEqual( result );  // same as [0, 2,  0]
					ps.restart();
					expect( ps.getFragment( [0, 2, -1], maxChars )).toEqual( result );  // same as [0, 2,  0]
				});

				// sentence boundry
				it("past the last word in the current sentence, it should give the 1st fragment from the 2nd word, 1 sentence forward.", function () {
					var result = 'I';
					ps.getFragment( [0, 3, 0], maxChars );
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("past the last word in the current sentence, it should give the 1st fragment from the 2nd word, 1 sentence forward, no matter what later integers are provided.", function () {
					var result = 'I';
					ps.getFragment( [0, 3, 0], maxChars );
					expect( ps.getFragment( [0, 2, -1], maxChars )).toEqual( result );  // same as [0, 2,  0]
				});

			});  // End 2 words

			describe("more words than exist", function () {

				it("should return the 1st fragment in the last word in the last sentence.", function () {
					var result = 'walr-';
					expect( ps.getFragment( [0, 100, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

			});

			// --- Fragments ---
			describe("1 fragment", function () {

				describe("at the very last fragment,", function () {

					it("should return the last fragment in the last word in the last sentence.", function () {
						var result = 'us?';
						expect( ps.getFragment( [4, 0, 0], maxChars )).toEqual( 'walr-' );
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
					});

					describe("and then asked for the current fragment", function () {

						it("should retain a the position at the last fragment.", function () {
							ps.getFragment( [4, 0, 0], maxChars )
							var frag1 = ps.getFragment( [0, 0, 1], maxChars )
							expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( frag1 )
						});

					});

				});


				describe("should give the next fragment", function () {
		
					it("- the 2nd fragment when at the start of a 3 fragment word.", function () {
						var result = 'orio-';
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( 'Vict-' );
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
					});
		
					it("- the 3rd fragment when in the 2nd fragment of a 3 fragment word.", function () {
						var result = 'us,';
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual( 'orio-' );
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
					});

					describe("and then, asked for the current fragment,", function () {

						it("should retain the mid-word fragment position (the 2nd fragment when at the start of a 3 fragment word).", function () {
							var frag1 = ps.getFragment( [0, 0, 1], maxChars )
							expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( frag1 )
						});

						it("should retain the mid-word fragment position (the 3rd fragment when in the 2nd fragment of a 3 fragment word).", function () {
							ps.getFragment( [0, 0, 1], maxChars )
							var frag1 = ps.getFragment( [0, 0, 1], maxChars )
							expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( frag1 )
						});

					});

				});  // End multi-fragment stepping
	
				describe("past the last fragment in the current word,", function () {

					it("it should give the 1st fragment 1 word forward.", function () {
						var result = 'you';
						ps.getFragment( [0, 0, 2], maxChars );
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
					});

				});
				
				describe("past the last fragment in the current sentence,.", function () {
					
					it("it should give the 1st fragment 1 sentence forward.", function () {
						var result = 'Del-';
						expect( ps.getFragment( [0, 3, 0], maxChars )).toEqual( 'flag.' );
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
					});

				});

			});  // End 1 fragment

			describe("2 fragments", function () {

				describe("at the very last fragment,", function () {
					
					// TODO: Desired behavior? Elsewhere, we get the first fragment in the
					// next word. On the last word, which fragment do we want?
					it("it should return the last fragment in the last word in the last sentence.", function () {
						var result = 'walr-';
						expect( ps.getFragment( [4, 0, 0], maxChars )).toEqual( result );
						expect( ps.getFragment( [0, 0, 2], maxChars )).toEqual( result );  // Want 'us?'
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
					});

				});
	
				it("should give the fragment 2 fragments forward from this one.", function () {
					var result = 'us,';
					expect( ps.getFragment( [0, 0, 2], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("or more past the last fragment in the current word, it should give the 1st fragment 1 word forward.", function () {
					var result = 'you';
					expect( ps.getFragment( [0, 0, 6], maxChars )).toEqual( result );  // ??: Should this be the behavior? What should it be?
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("past the last fragment in the current sentence, it should give the 1st fragment 1 sentence forward.", function () {
					var result = 'Del-';
					ps.getFragment( [0, 2, 0], maxChars );
					expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual( 'flag.' );
					expect( ps.getFragment( [0, 0, 6], maxChars )).toEqual( result );  // ??: Should this be the behavior? What should it b e?
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

			});  // End 2 fragments

			// More fragments than exist just go to the next word

		});  // End forward


		// --- Backward ---
		describe("and stepped backward (1st non-zero integer found is the one that counts)", function () {
			
			// --- Sentences ---
			describe("1 sentence", function () {

				it("at the very 1st sentence, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [-1, 0, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment of the previous sentence.", function () {
					var result = '\n';
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [-1, 0, 0], maxChars )).toEqual( result );  // same as [-1, 0,  0]
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment of the previous sentence, no matter what later integers are provided.", function () {
					var result = '\n';
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [-1, 2, 0], maxChars )).toEqual( result );  // same as [-1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [-1, 0, 2], maxChars )).toEqual( result );  // same as [-1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [-1, -1, 0], maxChars )).toEqual( result );  // same as [-1, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [-1, 0, -1], maxChars )).toEqual( result );  // same as [-1, 0,  0]
				});

			});

			describe("2 sentences", function () {

				it("at the very 1st sentence, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [-2, 0, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 2 sentence backward.", function () {
					var result = 'Del-';
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [-2, 0, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 2 sentence backward, no matter what later integers are provided.", function () {
					var result = 'Del-';
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [-2, 2, 0], maxChars )).toEqual( result );  // same as [-2, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [-2, 0, 2], maxChars )).toEqual( result );  // same as [-2, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [-2, -1, 0], maxChars )).toEqual( result );  // same as [-2, 0,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [-2, 0, -1], maxChars )).toEqual( result );  // same as [-2, 0,  0]
				});

			});

			// --- Words ---
			describe("1 word", function () {

				it("at the very 1st word, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, -1, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 1 word backward.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( 'you' );
					expect( ps.getFragment( [0, -1, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 1 word backward, no matter what later integers are provided.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( 'you' );
					expect( ps.getFragment( [0, -1, 1], maxChars )).toEqual( result );  // same as [0, -1,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( 'you' );
					expect( ps.getFragment( [0, -1, 2], maxChars )).toEqual( result );  // same as [0, -1,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( 'you' );
					expect( ps.getFragment( [0, -1, -1], maxChars )).toEqual( result );  // same as [0, -1,  0]
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 1 word backward, crossing sentence boundries.", function () {
					var result = '\n';
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -1, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 1 word backward, crossing sentence boundries, no matter what later integers are provided.", function () {
					var result = '\n';
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -1, 1], maxChars )).toEqual( result );  // same as [0, -1,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -1, 2], maxChars )).toEqual( result );  // same as [0, -1,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -1, -1], maxChars )).toEqual( result );  // same as [0, -1,  0]
				});

			});

			describe("2 words", function () {

				it("at the very 1st word, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, -2, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 2 words backward.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual( 'brave' );
					expect( ps.getFragment( [0, -2, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("should give the 1st fragment 2 words backward, no matter what later integers are provided.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( 'you' );
					expect( ps.getFragment( [0, -2, 1], maxChars )).toEqual( result );  // same as [0, -2,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( 'you' );
					expect( ps.getFragment( [0, -2, 2], maxChars )).toEqual( result );  // same as [0, -2,  0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( 'you' );
					expect( ps.getFragment( [0, -2, -1], maxChars )).toEqual( result );  // same as [0, -2,  0]
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 2 words backward, crossing sentence boundries.", function () {
					var result = 'back.';
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -2, 0], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 2 words backward, crossing sentence boundries, no matter what later integers are provided.", function () {
					var result = 'back.';
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -2, 1], maxChars )).toEqual( result );  // same as [0, -2,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -2, 2], maxChars )).toEqual( result );  // same as [0, -2,  0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual( 'Why,' );
					expect( ps.getFragment( [0, -2, -1], maxChars )).toEqual( result );  // same as [0, -2,  0]
				});

			});

			// --- Fragments ---
			describe("1 fragment", function () {

				it("at the very 1st fragment of the 1st word, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				describe("should give the previous fragment", function () {
		
					it("- the 1st fragment when in the 2nd fragment of a three fragment word.", function () {
						var result = 'Vict-';
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual( 'orio-' );
						expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
					});
					
					it("- the 2nd fragment when in the 3rd fragment of a three fragment word.", function () {
						var result = 'orio-';
						expect( ps.getFragment( [0, 0, 2], maxChars )).toEqual( 'us,' );
						expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual( result );
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
					});
				});
				
				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( 'you' );
					expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward, not just always go to the start of the sentence.", function () {
					var result = 'you';
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual( 'brave' );
					expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

				it("before the 1st fragment in the current sentence, it should give the 1st fragment of the last word 1 sentence backward.", function () {
					var result = 'flag.';
					expect( ps.getFragment( [1, 0, 0], maxChars )).toEqual( 'Del-' );
					expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

			});

			// Going back multiple fragments is only different within one word with multiple fragments
			describe("2 fragments", function () {

				it("at the very 1st fragment of the 1st word, it should return the 1st word in the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

				it("while at the 3rd fragment, should give the 1st fragment.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 0, 2], maxChars )).toEqual( 'us,' );
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

				// TODO: Change this to something not crossing sentence boundries?
				it("while at the 2nd fragment, should give the 1st fragment 1 word backward.", function () {
					var result = 'flag.';
					expect( ps.getFragment( [1, 0, 0], maxChars )).toEqual( 'Del-' );
					expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual( 'irio-' );
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

				// TODO: Change this to something not crossing sentence boundries?
				it("while at the 1nd fragment in the array as a whole, should give the 1st fragment, not attempting to travel out of the array.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual( 'you' );
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward, not just always go to the start of the sentence.", function () {
					var result = 'you';
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual( 'brave' );
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

				it("before the 1st fragment in the current sentence, it should give the 1st fragment 1 sentence backward.", function () {
					var result = 'flag.';
					expect( ps.getFragment( [1, 0, 0], maxChars )).toEqual( 'Del-' );
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
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
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("when starting at the middle of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 5 ) ).toEqual( 'I' );
					expect( ps.getFragment( -1 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("when starting at the end of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 11 ) ).toEqual( result );
					expect( ps.getFragment( -1 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

			});
			
			describe("of -2 should get the second to last word", function () {
				
				it("when starting at the start of the collection.", function () {
					var result = 'oh';
					expect( ps.getFragment( 0 ) ).toEqual( 'Vict-' );
					expect( ps.getFragment( -2 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("when starting at the middle of the collection.", function () {
					var result = 'oh';
					expect( ps.getFragment( 5 ) ).toEqual( 'I' );
					expect( ps.getFragment( -2 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				
				it("when starting at the end of the collection.", function () {
					var result = 'oh';
					expect( ps.getFragment( 11 ) ).toEqual( 'walr-' );
					expect( ps.getFragment( -2 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

			});
			
			describe("of 0 should get the 1st word", function () {
				
				it("even when starting at the start of the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( 0 ) ).toEqual( 'Vict-' );
					expect( ps.getFragment( 0 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				it("when starting at the middle of the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( 5 ) ).toEqual( 'I' );
					expect( ps.getFragment( 0 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				it("when starting at the end of the collection.", function () {
					var result = 'Vict-';
					expect( ps.getFragment( 11 ) ).toEqual( 'walr-' );
					expect( ps.getFragment( 0 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

			});
			
			describe("of 5 should get the 6th word", function () {
				
				it("when starting at the start of the collection.", function () {
					var result = 'I';
					expect( ps.getFragment( 0 ) ).toEqual( 'Vict-' );
					expect( ps.getFragment( 5 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				it("when starting at the middle of the collection.", function () {
					var result = 'I';
					expect( ps.getFragment( 5 ) ).toEqual( 'I' );
					expect( ps.getFragment( 5 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				it("when starting at the end of the collection.", function () {
					var result = 'I';
					expect( ps.getFragment( 11 ) ).toEqual( 'walr-' );
					expect( ps.getFragment( 5 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

			});
			
			describe("of 11, in the 12 word collection, should get the 12th word", function () {
				
				it("when starting at the start of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 0 ) ).toEqual( 'Vict-' );
					expect( ps.getFragment( 11 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				it("when starting at the middle of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 5 ) ).toEqual( 'I' );
					expect( ps.getFragment( 11 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});
				it("even when starting at the end of the collection.", function () {
					var result = 'walr-';
					expect( ps.getFragment( 11 ) ).toEqual( 'walr-' );
					expect( ps.getFragment( 11 ) ).toEqual( result );
					expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( result );  // retain position
				});

			});

		});  // End call `.getFragment()` using an index number


		// --- Getters ---
		describe("and the number of strings in the array is 12", function () {

			describe("should return progress as a fraction based on: current word (not fragment) number / number of total words.", function () {

				it("It should be 0 on the 1st word.", function () {
					ps.getFragment( [0, 0, 0], maxChars );
					expect( ps.getProgress() ).toEqual( 0 );
					ps.getFragment( [0, 0, 1], maxChars );
					expect( ps.getProgress() ).toEqual( 0 );
					ps.getFragment( [0, 0, 1], maxChars );
					expect( ps.getProgress() ).toEqual( 0 );
				});

				it("It should be 1/11 on the 2nd word.", function () {
					ps.getFragment( [0, 1, 0], maxChars );
					expect( ps.getProgress() ).toEqual( 1/11 );
				});

				it("It should be 4/11 on the 5th word, when moved forward a sentence.", function () {
					ps.getFragment( [1, 0, 0], maxChars );
					expect( ps.getProgress() ).toEqual( 4/11 );
				});

				it("It should be 1 on the 12th word.", function () {
					ps.getFragment( [5, 0, 0], maxChars );
					expect( ps.getProgress() ).toEqual( 1 );
				});

			});

			describe("should return 'index' as an integer based on current word (not fragment) as if it were in an array of words/strings.", function () {

				it("It should be 0 on the 1st word.", function () {
					ps.getFragment( [0, 0, 0], maxChars );
					expect( ps.getIndex() ).toEqual( 0 );
					ps.getFragment( [0, 0, 1], maxChars );
					expect( ps.getIndex() ).toEqual( 0 );
					ps.getFragment( [0, 0, 1], maxChars );
					expect( ps.getIndex() ).toEqual( 0 );
				});

				it("It should be 1 on the 2nd word.", function () {
					ps.getFragment( [0, 1, 0], maxChars );
					expect( ps.getIndex() ).toEqual( 1);
				});

				it("It should be 4 on the 5th word, when moved forward a sentence.", function () {
					ps.getFragment( [1, 0, 0], maxChars );
					expect( ps.getIndex() ).toEqual( 4 );
				});

				it("It should be 11 on the 12th word.", function () {
					ps.getFragment( [5, 0, 0], maxChars );
					expect( ps.getIndex() ).toEqual( 11 );
				});

			});

			it("should return 'length' as an integer as if the array were in an array of words/strings.", function () {
				expect( ps.getLength() ).toEqual( 12 );
			});

		});  // End `.get` progress, index, and length for length 12 collection



		// --- Reset maxChars ---
		describe("and it's maximum characters is reset", function () {

			describe("through `.setMaxChars()`", function () {

				describe("should change the length of the strings returned accordingly", function () {
					
					it("to 20 characters, and stay that way.", function () {
						ps.setMaxChars(20);
						expect( ps.getFragment( [0, 0, 0] )).toEqual('Victorious,');
						expect( ps.getFragment( [0, 0, 1] )).toEqual('you');
					});
					
					it("to 2 characters, and stay that way.", function () {
						ps.setMaxChars(2);
						expect( ps.getFragment( [0, 0, 0] )).toEqual('V-');
						expect( ps.getFragment( [0, 0, 1] )).toEqual('i-');
					});

				});

			});  // End `.setMaxChars()`

			describe("through `.getFragment()`", function() {

				describe("should change the length of the strings returned accordingly", function () {
					
					it("to 20 characters, and stay that way.", function () {
						expect( ps.getFragment( [0, 0, 0], 20 )).toEqual('Victorious,');
						expect( ps.getFragment( [0, 0, 1] )).toEqual('you');
					});
					
					it("to 2 characters, and stay that way.", function () {
						expect( ps.getFragment( [0, 0, 0], 2 )).toEqual('V-');
						expect( ps.getFragment( [0, 0, 1] )).toEqual('i-');
					});

				});

			});  // End `.getFragment()`

			describe("through `.restart()`", function() {

				describe("should change the length of the strings returned accordingly", function () {
					
					it("to 20 characters, and stay that way.", function () {
						ps.restart( 20 )
						expect( ps.getFragment( [0, 0, 0] )).toEqual('Victorious,');
						expect( ps.getFragment( [0, 0, 1] )).toEqual('you');
					});
					
					it("to 2 characters, and stay that way.", function () {
						ps.restart( 2 )
						expect( ps.getFragment( [0, 0, 0] )).toEqual('V-');
						expect( ps.getFragment( [0, 0, 1] )).toEqual('i-');
					});

				});

			});  // End `.restart()`

			describe("while in the middle of a multi-fragment word", function() {
				
				describe("to 20 characters", function () {

					it("the word should restart, providing the correct number of characters.", function () {
						expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
						expect( ps.getFragment( [0, 0, 0], 20 )).toEqual('Victorious,');
						expect( ps.getFragment( [0, 0, 1] )).toEqual('you');
					});
				});
				
				describe("to 2 characters", function () {

					it("the word should restart, providing the correct number of characters.", function () {
						expect( ps.getFragment( [0, 0, 1] )).toEqual('orio-');
						expect( ps.getFragment( [0, 0, 0], 2 )).toEqual('V-');
						expect( ps.getFragment( [0, 0, 1] )).toEqual('i-');
					});

				});

			});  // End middle of multi-fragment word

		});  // End maxChars

	});  // End expected values

	// "When a ProseStepper instance"
	describe("gets unexpected values", function () {

		// Takes: [[str]], int. Can't allow placeholder value - `.positions` can't be created properly otherwise
		describe("for `.process()`,", function () {

			// No processing before each

			describe("the 1st argument is undefined,", function () {

				it("it should throw an REFERENCE error", function () {
					expect( function () { ps.process(); }).toThrowError( ReferenceError );
				});

			});

			describe("the 1st argument is not an array of arrays of strings,", function () {

				describe("it's not an array at all,", function () {

					it("(null) it should throw an TYPE error", function () {
						expect( function () { ps.process( null, maxChars ); }).toThrowError( TypeError );
					});

					it("(true) it should throw an TYPE error", function () {
						expect( function () { ps.process( true, maxChars ); }).toThrowError( TypeError );
					});

					it("(false) it should throw an TYPE error", function () {
						expect( function () { ps.process( false, maxChars ); }).toThrowError( TypeError );
					});

					it("(NaN) it should throw an TYPE error", function () {
						expect( function () { ps.process( NaN, maxChars ); }).toThrowError( TypeError );
					});

					it("(0) it should throw an TYPE error", function () {
						expect( function () { ps.process( 0, maxChars ); }).toThrowError( TypeError );
					});

					it("(1) it should throw an TYPE error", function () {
						expect( function () { ps.process( 1, maxChars ); }).toThrowError( TypeError );
					});

					it("(number) it should throw an TYPE error", function () {
						expect( function () { ps.process( 2, maxChars ); }).toThrowError( TypeError );
					});

					it("(string) it should throw an TYPE error", function () {
						expect( function () { ps.process( 'test', maxChars ); }).toThrowError( TypeError );
					});

				});  // === other

				describe("it's an array of something else,", function () {

					it("([]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [], maxChars ); }).toThrowError( TypeError );
					});

					it("([null, null]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [null, null], maxChars ); }).toThrowError( TypeError );
					});

					it("([true]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [true], maxChars ); }).toThrowError( TypeError );
					});

					it("([false]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [false], maxChars ); }).toThrowError( TypeError );
					});

					it("([NaN]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [NaN], maxChars ); }).toThrowError( TypeError );
					});

					it("([{}]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [{}], maxChars ); }).toThrowError( TypeError );
					});

					it("([0]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [0], maxChars ); }).toThrowError( TypeError );
					});

					it("([1]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [1], maxChars ); }).toThrowError( TypeError );
					});

					it("([number]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [2], maxChars ); }).toThrowError( TypeError );
					});

					it("([string]) it should throw an TYPE error", function () {
						expect( function () { ps.process( ['test'], maxChars ); }).toThrowError( TypeError );
					});

				});  // === [other]

				describe("it's an array of arrays of something else,", function () {

					it("([[]]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [[]], maxChars ); }).toThrowError( TypeError );
					});

					it("([[null, null]]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [[null, null]], maxChars ); }).toThrowError( TypeError );
					});

					it("([[true]]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [[true]], maxChars ); }).toThrowError( TypeError );
					});

					it("([[false]]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [[false]], maxChars ); }).toThrowError( TypeError );
					});

					it("([[NaN]]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [[NaN]], maxChars ); }).toThrowError( TypeError );
					});

					it("([[{}]]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [[{}]], maxChars ); }).toThrowError( TypeError );
					});

					it("([[0]]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [[0]], maxChars ); }).toThrowError( TypeError );
					});

					it("([[1]]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [[1]], maxChars ); }).toThrowError( TypeError );
					});

					it("([[2]]) it should throw an TYPE error", function () {
						expect( function () { ps.process( [[2]], maxChars ); }).toThrowError( TypeError );
					});

				});  // === [[other]]

			});  // !== [[str]]

			describe("the 2nd argument is undefined,", function () {

				it("it should throw an REFERENCE error", function () {
					expect( function () { ps.process( sentences ); }).toThrowError( ReferenceError );
				});

			});

			describe("the 2nd argument is not a number > 0,", function () {

				it(", `null`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, null ); }).toThrowError( TypeError );
				});

				it(", `true`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, true ); }).toThrowError( TypeError );
				});

				it(", `false`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, false ); }).toThrowError( TypeError );
				});

				it(", `NaN`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, NaN ); }).toThrowError( TypeError );
				});

				it(", `{}`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, {} ); }).toThrowError( TypeError );
				});

				it(", `[]`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, [] ); }).toThrowError( TypeError );
				});

				it(", `0`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, 0 ); }).toThrowError( RangeError );
				});

				it(", `-1`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, -1 ); }).toThrowError( RangeError );
				});

				it(", `1.1`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, 1.1 ); }).toThrowError( TypeError );
				});

				it(", `'[['text']]'`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, "[['text']]" ); }).toThrowError( TypeError );
				});

			});  // End 2nd argument

		});  // End .process()

		// Takes: [int, int, int]
		describe("for `.getFragment()`,", function () {


			beforeEach( function () {
				ps.process( sentences, maxChars );
			});


			describe("the 1st argument is undefined,", function () {

				it("it should throw an REFERENCE error", function () {
					expect( function () { ps.getFragment(); }).toThrowError( ReferenceError );
				});

			});

			describe("the 1st argument is not array,", function () {

				it("(null) it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( null, maxChars ); }).toThrowError( TypeError );
				});

				it("(true) it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( true, maxChars ); }).toThrowError( TypeError );
				});

				it("(false) it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( false, maxChars ); }).toThrowError( TypeError );
				});

				it("(NaN) it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( NaN, maxChars ); }).toThrowError( TypeError );
				});

				it("({}) it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( {}, maxChars ); }).toThrowError( TypeError );
				});

				it("(1.1) it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( 1.1, maxChars ); }).toThrowError( TypeError );
				});

				it("('test') it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( 'test', maxChars ); }).toThrowError( TypeError );
				});

			});  // End 1st !== []


			describe("the 1st argument is an array containing non ints", function () {

				describe("in the 1st slot,", function () {

					it("(undefined) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [undefined, 0, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("(null) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [null, 0, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("(true) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [true, 0, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("(false) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [false, 0, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("(NaN) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [NaN, 0, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("([]) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [[], 0, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("({}) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [{}, 0, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("(1.1) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [1.1, 0, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("('test') it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( ['test', 0, 0], maxChars ); }).toThrowError( TypeError );
					});

				});  // End 1st arg === [other, int, int]

				describe("in the 2nd slot,", function () {

					it("(undefined) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, undefined, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("(null) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, null, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("(true) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, true, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("(false) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, false, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("(NaN) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, NaN, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("([]) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, [], 0], maxChars ); }).toThrowError( TypeError );
					});

					it("({}) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, {}, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("(1.1) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 1.1, 0], maxChars ); }).toThrowError( TypeError );
					});

					it("('test') it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 'test', 0], maxChars ); }).toThrowError( TypeError );
					});

				});  // End 1st arg === [int, other, int]

				describe("in the 3rd slot,", function () {

					it("(undefined) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, undefined], maxChars ); }).toThrowError( TypeError );
					});

					it("(null) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, null], maxChars ); }).toThrowError( TypeError );
					});

					it("(true) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, true], maxChars ); }).toThrowError( TypeError );
					});

					it("(false) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, false], maxChars ); }).toThrowError( TypeError );
					});

					it("(NaN) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, NaN], maxChars ); }).toThrowError( TypeError );
					});

					it("([]) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, []], maxChars ); }).toThrowError( TypeError );
					});

					it("({}) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, {}], maxChars ); }).toThrowError( TypeError );
					});

					it("(1.1) it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, 1.1], maxChars ); }).toThrowError( TypeError );
					});

					it("('test') it should throw an TYPE error", function () {
						expect( function () { ps.getFragment( [0, 0, 'test'], maxChars ); }).toThrowError( TypeError );
					});

				});  // End 1st arg === [int, int, other]

			});  // End 1st === [other]



			var step = [0, 0, 0];

			// It's ok for the second argument to be undefined at this point
			// TODO: This behavior is questionable and should be discussed
			describe("the 2nd argument is undefined,", function () {

				it("it should not throw an error", function () {
					expect( function () { ps.getFragment( step ); }).not.toThrowError( ReferenceError );
				});

			});


			describe("the 2nd argument is not an integer > 0,", function () {

				it(", `null`, it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( step, null ); }).toThrowError( TypeError );
				});

				it(", `true`, it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( step, true ); }).toThrowError( TypeError );
				});

				it(", `false`, it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( step, false ); }).toThrowError( TypeError );
				});

				it(", `NaN`, it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( step, NaN ); }).toThrowError( TypeError );
				});

				it(", `{}`, it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( step, {} ); }).toThrowError( TypeError );
				});

				it(", `[]`, it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( step, [] ); }).toThrowError( TypeError );
				});

				it(", `0`, it should throw an TYPE error", function () {
					expect( function () { ps.process( sentences, 0 ); }).toThrowError( RangeError );
				});

				it(", `-1`, it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( step, -1 ); }).toThrowError( RangeError );
				});

				it(", `1.1`, it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( step, 1.1 ); }).toThrowError( TypeError );
				});

				it(", `'[['text']]'`, it should throw an TYPE error", function () {
					expect( function () { ps.getFragment( step, "[['text']]" ); }).toThrowError( TypeError );
				});

			});  // End 2nd argument .getFragment()

		});  // End .getFragment()

		// Takes: positive int > 0 or undefined
		describe("for `.restart()`", function () {

			describe("with argument that's not a positive int > 0", function () {  // (This passes in current version, needs fix)

				it(", `null`, it should throw an TYPE error", function () {
					expect( function () { ps.restart( null ); }).toThrowError( TypeError );
				});

				it(", `true`, it should throw an TYPE error", function () {
					expect( function () { ps.restart( true ); }).toThrowError( TypeError );
				});

				it(", `false`, it should throw an TYPE error", function () {
					expect( function () { ps.restart( false ); }).toThrowError( TypeError );
				});

				it(", `NaN`, it should throw an TYPE error", function () {
					expect( function () { ps.restart( NaN ); }).toThrowError( TypeError );
				});

				it(", `{}`, it should throw an TYPE error", function () {
					expect( function () { ps.restart( {} ); }).toThrowError( TypeError );
				});

				it(", `[]`, it should throw an TYPE error", function () {
					expect( function () { ps.restart( [] ); }).toThrowError( TypeError );
				});

				it(", `0`, it should throw an TYPE error", function () {
					expect( function () { ps.restart( 0 ); }).toThrowError( RangeError );
				});

				it(", `-1`, it should throw an TYPE error", function () {
					expect( function () { ps.restart( -1 ); }).toThrowError( RangeError );
				});

				it(", `1.1`, it should throw an TYPE error", function () {
					expect( function () { ps.restart( 1.1 ); }).toThrowError( TypeError );
				});

				it(", `'[['text']]'`, it should throw an TYPE error", function () {
					expect( function () { ps.restart( "[['text']]" ); }).toThrowError( TypeError );
				});

			});  // End unexpected value

		});  // End .restart()

		// Takes: positive int > 0
		describe("for `.setMaxChars()`", function () {

			describe("with argument that's not a positive int > 0", function () {  // (This passes in current version, needs fix)

				it(", `null`, it should throw an TYPE error", function () {
					expect( function () { ps.setMaxChars( null ); }).toThrowError( TypeError );
				});

				it(", `true`, it should throw an TYPE error", function () {
					expect( function () { ps.setMaxChars( true ); }).toThrowError( TypeError );
				});

				it(", `false`, it should throw an TYPE error", function () {
					expect( function () { ps.setMaxChars( false ); }).toThrowError( TypeError );
				});

				it(", `NaN`, it should throw an TYPE error", function () {
					expect( function () { ps.setMaxChars( NaN ); }).toThrowError( TypeError );
				});

				it(", `{}`, it should throw an TYPE error", function () {
					expect( function () { ps.setMaxChars( {} ); }).toThrowError( TypeError );
				});

				it(", `[]`, it should throw an TYPE error", function () {
					expect( function () { ps.setMaxChars( [] ); }).toThrowError( TypeError );
				});

				it(", `0`, it should throw an TYPE error", function () {
					expect( function () { ps.setMaxChars( 0 ); }).toThrowError( RangeError );
				});

				it(", `-1`, it should throw an TYPE error", function () {
					expect( function () { ps.setMaxChars( -1 ); }).toThrowError( RangeError );
				});

				it(", `1.1`, it should throw an TYPE error", function () {
					expect( function () { ps.setMaxChars( 1.1 ); }).toThrowError( TypeError );
				});

				it(", `'[['text']]'`, it should throw an TYPE error", function () {
					expect( function () { ps.setMaxChars( "[['text']]" ); }).toThrowError( TypeError );
				});

			});  // End unexpected value

		});  // End .setMaxChars()

	});  // End Unexpected Values


});  // End ProseStepper
