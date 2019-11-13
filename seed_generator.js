var seed = require("./seed_data/seed_words.js")
var seed_array = seed.seed_words


function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}

function hello(){
		var i = seed_array.length
		var Strings = ""
		for(n=0; n<=12; n++){
			var indexes = randomIntInc(0, i)
			Strings = Strings + " " + seed_array[indexes]
		}
		return Strings
		console.log(Strings)

	}

console.log(hello())


module.exports = {
	seed_gen: hello()
}