import Genetic from "npm:genetic-js@0.1.14";
import { parse, stringify } from "https://deno.land/std@0.205.0/csv/mod.ts";
import * as pl from 'npm:nodejs-polars@0.8.2'
import {
    createCanvas,
    Image,
    Path2D,
	Fonts
  } from "https://deno.land/x/skia_canvas/mod.ts";
Fonts.registerDir(Deno.env.get("FONT_DIR") ?? "/usr/share/fonts")



Deno.env.get("FONT")
const inputData = parse(await Deno.readTextFile("assets/data.csv"), {
    skipFirstRow: true,
    columns: ["distance", "dbm"],
  });

const inputDataDbm = inputData.map((row) => [row.distance, row.dbm]);
const inputDataAbs = inputData.map((row) => [row.distance, Math.pow(10,row.dbm/10)]);

const genetic = Genetic.create();

genetic.optimize = Genetic.Optimize.Minimize;
genetic.select1 = Genetic.Select1.Tournament2;
genetic.select2 = Genetic.Select2.FittestRandom;

genetic.seed = function() {	
	return [ Math.random() * 4, Math.random() * 1];
};

genetic.mutate = function(entity) {
	
	// allow chromosomal drift with this range (-0.05, 0.05)
	const driftA = ((Math.random()-0.5)*1);
	const driftK = ((Math.random()-0.5)*0.1);

    const newA = entity[0] + driftA;
    const newK = entity[1] + driftK;
	
	return [newA, newK];
};

genetic.crossover = function(mother, father) {

	// crossover via interpolation
	function lerp(a, b, p) {
		return a + (b-a)*p;
	}
	
	const len = mother.length;
	const i = Math.floor(Math.random()*len);
	const r = Math.random();
	const son = [].concat(father);
	const daughter = [].concat(mother);
	
	son[i] = lerp(father[i], mother[i], r);
	daughter[i] = lerp(mother[i], father[i], r);
	
	return [son, daughter];
};

// example 3 term polynomial: cx^0 + bx^1 + ax^2
genetic.evaluatePoly = function([a,k], x) {
    return k / (x ** a);
}
	
genetic.fitness = function(entity) {
	
	let sumSqErr = 0;
	const vertices = this.userData["vertices"];

	
	let i;
	for (i=0;i<vertices.length;++i) {
		const err = this.evaluatePoly(entity, vertices[i][0]) - vertices[i][1];
		sumSqErr += err*err;
	}
	
	return Math.sqrt(sumSqErr);
};


genetic.generation = function(pop, generation, stats) {
};

genetic.notification = function(pop, generation, stats, isFinished) {
    if (generation % 100 !== 0) return;
    console.log(generation+1,pop[0].fitness.toPrecision(4), pop[0].entity)
	
};

let config = {
    "iterations": 100000
    , "size": 250
    , "crossover": 0.4
    , "mutation": 1.0
    , "skip": 10
};

let userData = {
    "vertices": inputDataAbs
};

genetic.evolve(config, userData);