
var ProseStepper = require('../dist/prose-stepper.js');


describe("When a ProseStepper instance,", function () {

	var ps, maxChars, sentences;

	beforeEach(function () {
		ps 		  = new ProseStepper();
		maxChars  = 5;
		sentences = [  ['Victorious,','you','brave','flag.'], ['Delirious,','I','come','back.'], ['\n'], ['Why,','oh','why?'] ];

		ps.process( sentences, maxChars );
	})

	// ==== EXPECTED INPUT ====
	describe("is given an array of array of strings and a positive integer", function () {

		// --- Current ---
		describe("and asked for the current fragment without any stepping", function () {
			
			it("should give the 1st fragment", function () { expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual('Vict-') });

		});

		describe("and asked for the current fragment after stepping", function () {
			
			it("should give the same fragment again", function () {
				var frag1 = ps.getFragment( [0, 1, 0], maxChars )
				expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( frag1 )
				
				frag1 = ps.getFragment( [1, 0, 0], maxChars )
				expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual( frag1 )
			});

		});


		// --- Reset ---
		describe("and is manipulated in any way,", function () {
			
			it("`.restart` should start from the beginning again.", function () {
				ps.getFragment( [0, 1, 0], maxChars );
				ps.getFragment( [0, 1, 0], maxChars );
				ps.getFragment( [0, 1, 0], maxChars );
				ps.restart();
				expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual('Vict-');
			});

		});


		// --- Forward ---
		describe("and stepped forward (1st non-zero integer found is the one that counts)", function () {

			// --- Sentences ---
			describe("1 sentence", function () {

				it("at the very last sentence, it should return the last word in the last sentence.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [1, 0, 0], maxChars )).toEqual('why?');
				});

				// sentence boundry
				it("should give the 1st fragment of the next sentence.", function () {
					expect( ps.getFragment( [1, 0, 0], maxChars )).toEqual('Del-');
				});
				
				it("should give the 1st fragment of the next sentence, no matter what later integers are provided.", function () {
					expect( ps.getFragment( [1, 1, 0], maxChars )).toEqual('Del-');  // same as [1, 0, 0]
					ps.restart();
					expect( ps.getFragment( [1, 0, 1], maxChars )).toEqual('Del-');  // same as [1, 0, 0]
					ps.restart();
					expect( ps.getFragment( [1, 2, 0], maxChars )).toEqual('Del-');  // same as [1, 0, 0]
					ps.restart();
					expect( ps.getFragment( [1, 0, 2], maxChars )).toEqual('Del-');  // same as [1, 0, 0]
					ps.restart();
					expect( ps.getFragment( [1, -1, 0], maxChars )).toEqual('Del-');  // same as [1, 0, 0]
					ps.restart();
					expect( ps.getFragment( [1, 0, -1], maxChars )).toEqual('Del-');  // same as [1, 0, 0]
				});

			});

			describe("3 sentences", function () {

				it("at the very last sentence, it should return the last word in the last sentence.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('why?');
				});

				// sentence boundry
				it("should give the 1st fragment 3 sentence forward.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
				});
				
				it("should give the 1st fragment 3 sentence forward, no matter what later integers are provided.", function () {
					expect( ps.getFragment( [3, 1, 0], maxChars )).toEqual('Why,');  // same as [3, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 1], maxChars )).toEqual('Why,');  // same as [3, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, 2, 0], maxChars )).toEqual('Why,');  // same as [3, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 2], maxChars )).toEqual('Why,');  // same as [3, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, -1, 0], maxChars )).toEqual('Why,');  // same as [3, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, -1], maxChars )).toEqual('Why,');  // same as [3, 0, 0]
				});

			});

			describe("more sentences than exist", function () {

				it("it should return the last word in the last sentence.", function () {
					expect( ps.getFragment( [5, 0, 0], maxChars )).toEqual('why?');
				});

			});


			// --- Words ---
			describe("1 word", function () {

				it("at the very last word, it should return the last word in the last sentence.", function () {
					expect( ps.getFragment( [4, 0, 0], maxChars )).toEqual('why?');
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('why?');
				});

				// word boundry
				it("should give the 1st fragment from 1 word forward.", function () {
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('you');
				});
				
				it("should give the 1st fragment from 1 word forward, no matter what later integers are provided.", function () {
					expect( ps.getFragment( [0, 1, 1], maxChars )).toEqual('you');  // same as [0, 1, 0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 2], maxChars )).toEqual('you');  // same as [0, 1, 0]
					ps.restart();
					expect( ps.getFragment( [0, 1, -1], maxChars )).toEqual('you');  // same as [0, 1, 0]
				});

				// sentence boundry
				it("past the last word in the current sentence, it should give the 1st fragment 1 sentence forward.", function () {
					ps.getFragment( [0, 1, 0], maxChars )
					ps.getFragment( [0, 1, 0], maxChars )
					ps.getFragment( [0, 1, 0], maxChars )
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('Del-');
				});
				
				it("past the last word in the current sentence, it should give the 1st fragment 1 sentence forward, no matter what later integers are provided.", function () {
					ps.getFragment( [0, 1, 0], maxChars )
					ps.getFragment( [0, 1, 0], maxChars )
					ps.getFragment( [0, 1, 0], maxChars )
					expect( ps.getFragment( [0, 1, -1], maxChars )).toEqual('Del-');
				});

			});

			describe("2 words", function () {

				it("at the very last word, it should return the last word in the last sentence.", function () {
					expect( ps.getFragment( [4, 0, 0], maxChars )).toEqual('why?');
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual('why?');
				});

				// word boundry
				it("should give the 1st fragment from 2 words forward.", function () {
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual('brave');
				});
				
				it("should give the 1st fragment from 2 words forward, no matter what later integers are provided.", function () {
					expect( ps.getFragment( [0, 2, 1], maxChars )).toEqual('brave');  // same as [0, 2, 0]
					ps.restart();
					expect( ps.getFragment( [0, 2, 2], maxChars )).toEqual('brave');  // same as [0, 2, 0]
					ps.restart();
					expect( ps.getFragment( [0, 2, -1], maxChars )).toEqual('brave');  // same as [0, 2, 0]
				});

				// sentence boundry
				it("past the last word in the current sentence, it should give the 1st fragment from the 2nd word, 1 sentence forward.", function () {
					ps.getFragment( [0, 1, 0], maxChars );
					ps.getFragment( [0, 1, 0], maxChars );
					ps.getFragment( [0, 1, 0], maxChars );
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual('I');
				});
				
				it("past the last word in the current sentence, it should give the 1st fragment from the 2nd word, 1 sentence forward, no matter what later integers are provided.", function () {
					ps.getFragment( [0, 1, 0], maxChars );
					ps.getFragment( [0, 1, 0], maxChars );
					ps.getFragment( [0, 1, 0], maxChars );
					expect( ps.getFragment( [0, 2, -1], maxChars )).toEqual('I');  // same as [0, 2, 0]
				});

			});

			describe("more words than exist", function () {

				it("should return the last word in the last sentence.", function () {
					expect( ps.getFragment( [0, 100, 0], maxChars )).toEqual('why?');
				});

			});

			// --- Fragments ---
			describe("1 fragment", function () {

				it("at the very last fragment, it should return the last word in the last sentence.", function () {
					expect( ps.getFragment( [4, 0, 0], maxChars )).toEqual('why?');
					expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual('why?');
				});

				describe("should give the next fragment", function () {
					
					it("- the 2nd fragment when at the start of a 3 fragment word.", function () {
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual('Vict-');
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual('orio-');
					});
					
					it("- the 3rd fragment when in the 2nd fragment of a 3 fragment word.", function () {
						expect( ps.getFragment( [0, 0, 0], maxChars )).toEqual('Vict-');
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual('orio-');
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual('us,');
					});
				});
				
				it("past the last fragment in the current word, it should give the 1st fragment 1 word forward.", function () {
					ps.getFragment( [0, 0, 1], maxChars );
					ps.getFragment( [0, 0, 1], maxChars );
					expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual('you');
				});
				
				it("past the last fragment in the current sentence, it should give the 1st fragment 1 sentence forward.", function () {
					ps.getFragment( [0, 1, 0], maxChars );
					ps.getFragment( [0, 1, 0], maxChars );
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('flag.');
					expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual('Del-');
				});

			});

			describe("2 fragments", function () {

				it("at the very last fragment, it should return the last word in the last sentence.", function () {
					expect( ps.getFragment( [4, 0, 0], maxChars )).toEqual('why?');
					expect( ps.getFragment( [0, 0, 2], maxChars )).toEqual('why?');
				});
				
				it("should give the fragment 2 fragments forward from this one.", function () {
					expect( ps.getFragment( [0, 0, 2], maxChars )).toEqual('us,');
				});
				
				it("or more past the last fragment in the current word, it should give the 1st fragment 1 word forward.", function () {
					expect( ps.getFragment( [0, 0, 6], maxChars )).toEqual('you');  // ??: Should this be the behavior? What should it be?
				});
				
				it("past the last fragment in the current sentence, it should give the 1st fragment 1 sentence forward.", function () {
					ps.getFragment( [0, 1, 0], maxChars );
					ps.getFragment( [0, 1, 0], maxChars );
					expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual('flag.');
					expect( ps.getFragment( [0, 0, 6], maxChars )).toEqual('Del-');  // ??: Should this be the behavior? What should it be?
				});

			});

			// More fragments than exist just go to the next word

		});  // End forward


		// --- Backward ---
		describe("and stepped backward (1st non-zero integer found is the one that counts)", function () {
			
			// --- Sentences ---
			describe("1 sentence", function () {

				it("at the very 1st sentence, it should return the 1st word in the collection.", function () {
					expect( ps.getFragment( [-1, 0, 0], maxChars )).toEqual('Vict-');
				});
				
				it("should give the 1st fragment of the previous sentence.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [-1, 0, 0], maxChars )).toEqual('\n');  // same as [-1, 0, 0]
				});
				
				it("should give the 1st fragment of the previous sentence, no matter what later integers are provided.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [-1, 2, 0], maxChars )).toEqual('\n');  // same as [-1, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [-1, 0, 2], maxChars )).toEqual('\n');  // same as [-1, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [-1, -1, 0], maxChars )).toEqual('\n');  // same as [-1, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [-1, 0, -1], maxChars )).toEqual('\n');  // same as [-1, 0, 0]
				});

			});

			describe("2 sentences", function () {

				it("at the very 1st sentence, it should return the 1st word in the collection.", function () {
					expect( ps.getFragment( [-2, 0, 0], maxChars )).toEqual('Vict-');
				});
				
				it("should give the 1st fragment 2 sentence backward.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [-2, 0, 0], maxChars )).toEqual('Del-');  // same as [-2, 0, 0]
				});
				
				it("should give the 1st fragment 2 sentence backward, no matter what later integers are provided.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [-2, 2, 0], maxChars )).toEqual('Del-');  // same as [-2, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [-2, 0, 2], maxChars )).toEqual('Del-');  // same as [-2, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [-2, -1, 0], maxChars )).toEqual('Del-');  // same as [-2, 0, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [-2, 0, -1], maxChars )).toEqual('Del-');  // same as [-2, 0, 0]
				});

			});

			// --- Words ---
			describe("1 word", function () {

				it("at the very 1st word, it should return the 1st word in the collection.", function () {
					expect( ps.getFragment( [0, -1, 0], maxChars )).toEqual('Vict-');
				});
				
				it("should give the 1st fragment 1 word backward.", function () {
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('you');
					expect( ps.getFragment( [0, -1, 0], maxChars )).toEqual('Vict-');
				});
				
				it("should give the 1st fragment 1 word backward, no matter what later integers are provided.", function () {
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('you');
					expect( ps.getFragment( [0, -1, 1], maxChars )).toEqual('Vict-');  // same as [0, -1, 0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('you');
					expect( ps.getFragment( [0, -1, 2], maxChars )).toEqual('Vict-');  // same as [0, -1, 0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('you');
					expect( ps.getFragment( [0, -1, -1], maxChars )).toEqual('Vict-');  // same as [0, -1, 0]
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 1 word backward, crossing sentence boundries.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [0, -1, 0], maxChars )).toEqual('\n');
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 1 word backward, crossing sentence boundries, no matter what later integers are provided.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [0, -1, 1], maxChars )).toEqual('\n');  // same as [0, -1, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [0, -1, 2], maxChars )).toEqual('\n');  // same as [0, -1, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [0, -1, -1], maxChars )).toEqual('\n');  // same as [0, -1, 0]
				});

			});

			describe("2 words", function () {

				it("at the very 1st word, it should return the 1st word in the collection.", function () {
					expect( ps.getFragment( [0, -2, 0], maxChars )).toEqual('Vict-');
				});
				
				it("should give the 1st fragment 2 words backward.", function () {
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual('brave');
					expect( ps.getFragment( [0, -2, 0], maxChars )).toEqual('Vict-');
				});
				
				it("should give the 1st fragment 2 words backward, no matter what later integers are provided.", function () {
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('you');
					expect( ps.getFragment( [0, -2, 1], maxChars )).toEqual('Vict-');  // same as [0, -2, 0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('you');
					expect( ps.getFragment( [0, -2, 2], maxChars )).toEqual('Vict-');  // same as [0, -2, 0]
					ps.restart();
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('you');
					expect( ps.getFragment( [0, -2, -1], maxChars )).toEqual('Vict-');  // same as [0, -2, 0]
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 2 words backward, crossing sentence boundries.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [0, -2, 0], maxChars )).toEqual('back.');
				});
				
				it("before the 1st word in the current sentence, it should give the 1st fragment 2 words backward, crossing sentence boundries, no matter what later integers are provided.", function () {
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [0, -2, 1], maxChars )).toEqual('back.');  // same as [0, -2, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [0, -2, 2], maxChars )).toEqual('back.');  // same as [0, -2, 0]
					ps.restart();
					expect( ps.getFragment( [3, 0, 0], maxChars )).toEqual('Why,');
					expect( ps.getFragment( [0, -2, -1], maxChars )).toEqual('back.');  // same as [0, -2, 0]
				});

			});

			// --- Fragments ---
			describe("1 fragment", function () {

				it("at the very 1st fragment of the 1st word, it should return the 1st word in the collection.", function () {
					expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual('Vict-');
				});
				
				describe("should give the previous fragment", function () {
					
					it("- the 1st fragment when in the 2nd fragment of a three fragment word.", function () {
						expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual('orio-');
						expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual('Vict-');
					});
					
					it("- the 2nd fragment when in the 3rd fragment of a three fragment word.", function () {
						expect( ps.getFragment( [0, 0, 2], maxChars )).toEqual('us,');
						expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual('orio-');
					});
				});
				
				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward.", function () {
						expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('you');
						expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual('Vict-');
				});
				
				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward, not just always go to the start of the sentence.", function () {
						expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual('brave');
						expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual('you');
				});

				it("before the 1st fragment in the current sentence, it should give the 1st fragment of the last word 1 sentence backward.", function () {
						expect( ps.getFragment( [1, 0, 0], maxChars )).toEqual('Del-');
						expect( ps.getFragment( [0, 0, -1], maxChars )).toEqual('flag.');
				});

			});

			// Going back multiple fragments is only different within one word with multiple fragments
			describe("2 fragments", function () {

				it("at the very 1st fragment of the 1st word, it should return the 1st word in the collection.", function () {
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual('Vict-');
				});

				it("while at the 3rd fragment, should give the 1st fragment.", function () {
					expect( ps.getFragment( [0, 0, 2], maxChars )).toEqual('us,');
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual('Vict-');
				});

				// TODO: Change this to something not crossing sentence boundries?
				it("while at the 2nd fragment, should give the 1st fragment 1 word backward.", function () {
					expect( ps.getFragment( [1, 0, 0], maxChars )).toEqual('Del-');
					expect( ps.getFragment( [0, 0, 1], maxChars )).toEqual('irio-');
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual('flag.');
				});

				// TODO: Change this to something not crossing sentence boundries?
				it("while at the 1nd fragment in the array as a whole, should give the 1st fragment, not attempting to travel out of the array.", function () {
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual('Vict-');
				});

				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward.", function () {
					expect( ps.getFragment( [0, 1, 0], maxChars )).toEqual('you');
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual('Vict-');
				});
				
				it("before the 1st fragment in the current word, it should give the 1st fragment 1 word backward, not just always go to the start of the sentence.", function () {
					expect( ps.getFragment( [0, 2, 0], maxChars )).toEqual('brave');
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual('you');
				});

				it("before the 1st fragment in the current sentence, it should give the 1st fragment 1 sentence backward.", function () {
					expect( ps.getFragment( [1, 0, 0], maxChars )).toEqual('Del-');
					expect( ps.getFragment( [0, 0, -2], maxChars )).toEqual('flag.');
				});

			});

		});  // End backward

		xit('get progress')
		xit('get length')
		xit('get index')

	});  // End expected values

	
	describe("unexpected values", function () {

		describe("for `.process()`", function () {

			xit("should throw an ERROR", function () {});

		});  // End .process()

		describe("for `.getFragment()`", function () {

			describe("with string in a relevant array position", function () {  // (This passes in current version, needs fix)

				xit("should throw an ERROR", function () {});

			});  // End .process()

		});  // End .getFragment()

		// and other unexpected stuff

	});  // End Unexpected Values


});  // End ProseStepper
