#!/usr/bin/env node

'use strict';

const automaticRelease = require( './../index.js' ).automaticRelease;

// Run
automaticRelease()
	.then( () => {
		process.exit( 0 );
	} )
	.catch( () => {
		process.exit( 1 );
	} )
