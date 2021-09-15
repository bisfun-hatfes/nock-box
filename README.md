# nock-box
a minimalist Nock interpreter

# Description
A basic Nock interpreter, coded up for learning purposes. Parser needs to be refined, but should otherwise function correctly to the best of my knowledge.

# Usage
After installing dependencies with `yarn`, run the start script to hop into the interpreter.
```bash
yarn start
```

Example:
```bash
Nock Box 1.0.0 — A minimalist interpreter.

:> [11 [8 [1 [33 44]] [0 1]]]
[ [ 33, 44 ], 11 ]
```
To run in debug mode, pass `-d` to the start script. Displays raw errors and traces nock execution in the terminal.
