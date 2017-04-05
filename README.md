# prose-stepper
Navigate through the words and sentences of prose text, stepping backward and forward sequentially


# About
`prose-stepper` allows linear progress backwards and forwards through prose text, sentence by sentence and word by word, as well as jumping to locations in the text. Currently it only works if it's handed an array of sentences which are, themselves, arrays of words. It can also break words into smaller fragments.

It's in pretty early stages and has some behavior that hasn't yet been decided on. Some behavior that is inconsistent, though useful in some contexts, needs to be debated.


# API
## An Instance Without An Argument
A `ProseStepper` instance has defaults that mean it can be created with no arguments at all (see the defaults in the [section below](#An-Instance-With-Arguments)).

### Create an instance

***With Node***

```js
var PS = require('prose-stepper'),
    ps = new PS();
```

***In the Browser***

```js
var ps = new ProseStepper();
```

### Do Stuff

```js
// ================================
// DATA
// ================================
// Prose-Stepper needs an array of arrays of strings to traverse
var sentences = [ 
    [ 'Victorious,', 'you','brave', 'flag.' ],
    [ 'Delirious,', 'I', 'come', 'back.' ],
    [ '\n' ],
    [ 'Why,', 'oh', 'walrus?' ]
];

// ================================
// PROCESSING
// ================================
// Then warm it up by letting it munch on that data
ps1.process( sentences );

// ================================
// STEPPING
// ================================
// prose-stepper's `.getFragment()` can take an array with three
// integers - a vector with three deltas. That is, an array with
// three values that each indicate a direction and a distance to
// travel within each array. At the moment, only one of the deltas can
// be active at a time. The other's all have to be 0.

// All 0's will get you the current fragment. Result at the very start:
var one = ps1.getFragment( [0, 0, 0] );  // 'Victorious,'

// The first integer will move to the start of the next sentence.
var two = ps1.getFragment( [1, 0, 0] );  // 'Delirious,'

// The second integer will move to the start of the next word.
var three = ps1.getFragment( [0, 1, 0] );  // 'I'

// The third integer will move forward one fragment. At the end of a word
// it will move to the next word.
var four = ps1.getFragment( [0, 0, 1] );  // 'come'

// At the moment, fragments can only move forward one word at a time
// maximum.
var five = ps1.getFragment( [0, 0, 5] );  // 'back.'

// You can move backwards too
var six = ps1.getFragment( [0, 0, -1] );  // 'come'

// Word deltas can cross sentence boundries
var seven = ps1.getFragment( [0, -3, 0] );  // 'flag.'

// You can take multiple steps at a time with sentences...
var eight = ps1.getFragment( [3, 0, 0] );  // 'Why,'

// ...and with words, forwards and backwards
var nine = ps1.getFragment( [0, -7, 0] );  // 'brave'

// With stepping, you can't before the first word...
var ten = ps1.getFragment( [-100, 0, 0] );  // 'Victorious,'

// ...or past the last one
var eleven = ps1.getFragment( [100, 0, 0] );  // 'walrus?'

// In the middle of a sentence, a sentence delta of -1
// will go to the start of the current sentence
var twelve = ps1.getFragment( [-1, 0, 0] );  // 'Why,'


// ================================
// JUMPING
// ================================
// prose-stepper's `.getFragment()` can also take a positive
// or negative integer.

// Jump to any position in the text as if it were a flat array
var thirtn = ps1.getFragment( 10 );  // 'oh'

// Negative integers will loop and get stuff from the end of the
// collection
var fourtn = ps1.getFragment( -3 );  // 'Why,'

// Integers past the end of the collection... well, that behavior
// hasn't been decided yet. Currently, that just gives the
// last word.
var fiftn = ps1.getFragment( 20 );  // 'walrus?'
```

## An Instance With An Argument
A `Prose Stepper` instance with an optional reference to a `state` object. That object should never be deleted or changed in a destructive way. If it is, prose-stepper won't be able to access the changes you make. Depending on how you do it, it'll either error or use old values. Currently, the `state` object provides configs for splitting up words into fragments of a desired length (see [#Purposes](#Purposes) for details on why you'd want to do that).

```js
// `state` defaults
{
    // All properties are optional and have defaults.
    
    // maximum number of characters allowed in any returned value
    // (determines sizes of word fragments)
    maxNumCharacters: 13,

    // Symbol that will be added onto the ends of fragments (you're
    // hyphenating words here, like they're wrapping onto the next line) 
    separator: undefined,  // uses hyphenaxe default, '-'

    // If each returned string is only one character long, it would
    // be impossible to add a hyphen to show the word has been broken
    // up. If fragments are only two characters long, if you had a
    // hyphen that'd be one character and a hyphen for each returned
    // value. How about for three characters? This configures that
    // option - what is the minimum length that a word fragment has to
    // be in order to add a hyphen (or whatever other separator you want)?
    minLengthForSeparator: 3,

    // The number of characters desired as a minimum for the last 
    // string chunk (given as a fraction of the maximum characters
    // allowed in each result string)
    fractionOfMax: undefined,  // uses hyphenaxe default, 0.75

    // A function that makes the string chunks of the word more
    // evenly distributed. It takes an array of already evenly
    // distributed strings that do not include the last chunk,
    // an integer representing how many are desired in the last
    // chunk, and an integer of how many are currently slated
    // for being in the last chunk. Check out the default function
    // for more details
    redistribute: undefined  // uses hyphenaxe default function
}
```

Most of those `state` properties are for a package prose-stepper uses to make the word fragments. Right now, they include `fractionOfMax`, `redistribute`, and `separator`. Look at the [hyphenaxe README](https://github.com/knod/hyphenaxe) for details or changes that may not get updated here as promptly. Errors for those will be handled by hyphenaxe.

With a bit of adjustment, you can get some different behavior.

```js
// ================================
// CUSTOM `state` VALUES
// ================================
// Note: When you change `state` or `state` values, your current
// word gets reset to the start. See the example below.

var state      = { maxNumCharacters: 5 },
    ps2        = new ProseStepper( state ),
    sentences2 = [ [ 'Victorious,', 'you', 'brave', 'flag.' ] ];

ps2.process( sentences2 );

var one2 = ps2.getFragment( [0, 0, 0] );  // 'Vict-'

// Note the reset here to the beginning of the word despite
// a fragment delta of 1
state.separator = '%';
var two2 = ps2.getFragment( [0, 0, 1] );  // 'Vict%'
```

## Other Operations
```js
// ================================
// RESTART
// ================================
// Go back to the beginning of the text
ps2.getFragment( 5 )
ps2.restart()
// Get current fragment
var three2 = ps2.getFragment( [0, 0, 0] );  // 'Vict%'


// ================================
// GETTERS
// ================================

// A fraction between 0 and 1 inclusive representing where in the
// text you are. 0 is at the very start, 1 means you're at the end
var progress = ps2.getProgress();  // 0

// The number of words in the text collection
var length = ps2.getLength();  // 4

// The number of the word you're currently at
var index = ps2.getIndex();  // 0


// ================================
// SETTERS
// ================================

// Change the state object being used as a reference
var newState = { maxNumCharacters: 200 }
ps2.setState( newState );
// Note: This will also reset to the start of the current word
var two2 = ps2.getFragment( [0, 0, 1] );  // 'Victorious,'
```


# Purposes
It's built with RSVP ("rapid serial visual presentation" reading) apps in mind - apps that show you text one word at a time. RSVP can help increase accessibility for people with visual impairments or some people with certain learning difficulties. It can also be used for speed reading.

`prose-stepper` allows words to be broken into fragments of specific lengths because some visual impairments make larger words difficult to read. Some can limit vision to one small area, while others can blur vision so much that text has to be very large to be legible.


# Contributing

## Bugs
Bug reports welcome. File bugs in the repo's issue tracker at [https://github.com/knod/prose-stepper/issues](https://github.com/knod/prose-stepper/issues).

## Ideas/Developing
Also post ideas about behavior, or whatever else, in the repo's issue tracker at [https://github.com/knod/prose-stepper/issues](https://github.com/knod/prose-stepper/issues).

Pull requests are welcome, though I've got limited time to manage them. If you want to play with the code, fork the repo, clone it to your local machine, open the root directory of the repo in your terminal, and run `npm install`. Please run `npm test` before submitting pull requests to make sure all the tests still pass. If you're changing behavior please add new tests or test files (this project uses the jasmine package for testing) and adjust the README and the index.html page to reflect your changes (and don't forget to bump the version).


# License
MIT

