'use strict';

let Wit = null;
let interactive = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  interactive = require('../').interactive;
} catch (e) {
  Wit = require('node-wit').Wit;
  interactive = require('node-wit').interactive;
}

const accessToken = (() => {
  if (process.argv.length !== 3) {
    console.log('usage: node examples/quickstart.js <wit-access-token>');
    process.exit(1);
  }
  return process.argv[2];
})();

// Quickstart example
// See https://wit.ai/ar7hur/quickstart

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    return new Promise(function(resolve, reject) {
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
  },
  getForecast({context, entities}) {
    return new Promise(function(resolve, reject) {
      var location = firstEntityValue(entities, 'location')
      if (context.intent != 'weather'){
        context.forecast = context.intent
        return resolve(context);
      }
      if (location) {
        context.forecast = 'hoje pode chover em ' + location; // we should call a weather API here
        delete context.missingLocation;
      } else {
        context.missingLocation = true;
        delete context.forecast;
      }
      return resolve(context);
    });
  },
  veiculo({context, entities}){
	  return new Promise(function(resolve, reject) {
	  var distance = firstEntityValue(entities, 'distance')
    if (distance){
      if (distance < 2){
  		  context.veiculo = 'de carro e nem gasta guarda chuva';
  	  }else{
        context.veiculo = 'ah nao sô, da uma corridinha que nem molha';
      }
      delete context.missingDistance;
    }else{
      context.missingDistance = true;
      delete context.veiculo;
    }
    delete context.veiculo;
    return resolve(context);
  });
},
preferencia({context, entities}){
  return new Promise(function(resolve, reject) {
  var gosto = firstEntityValue(entities, 'gosto')
  if (gosto){
    context.sugestao = 'TWD'

  }else{
    context.missingGosto = true;
    delete context.sugestao;
  }

  return resolve(context);
});
},
fetchpics({context, entities}){
  // console.log('[fetchpics]','context',JSON.stringify(context));
  return new Promise(function(resolve, reject) {
    if (context.intent == 'verFotos'){
      if (!(allPics[context.cat])){
        // console.log('Nao achei nada da categoria',context.cat);
        context.naoAchei = true;
        delete context.achei;
        context.pics = allPics['default'];
      }else{
        var wantedPics = allPics[context.cat];
        context.pics = wantedPics[Math.floor(Math.random() * wantedPics.length)]
        context.achei = true;
        delete context.naoAchei;
      }

      delete context.intent
      // delete context.cat


    }
    return resolve(context);
  });
},
sentimento({context, entities}){
  // console.log('[sentimento]','context',JSON.stringify(context));
  delete context.ack;
  return new Promise(function(resolve, reject) {
    if (context.sentimento ){
      if (context.sentimento=='feliz'){
        context.ack = 'Que bom que gostou!'
      }
      if (context.sentimento=='triste'){
        context.ack = 'Vou tentar melhorar... :('
      }
      if (context.sentimento=='puto'){
        context.ack = 'Calma aí amigao, to só tentando ajudar'
      }
      if (context.sentimento=='top'){
        context.ack = 'Nao, top nao, o Cabelinho te mata'
      }


      delete context.intent
      delete context.sentimento


    }
    return resolve(context);
  });
},
merge({context, entities}){
  // console.log('[merge]','entities',JSON.stringify(entities));
  return new Promise(function(resolve, reject) {
  //delete context;

  var cat = firstEntityValue(entities, 'categoria')
  context.cat = cat;
  context.intent = firstEntityValue(entities, 'intent');
  context.sentimento = firstEntityValue(entities, 'sentimento');
  return resolve(context);
});
}
};

const client = new Wit({accessToken, actions});
interactive(client);

// LIST OF ALL PICS
var allPics = {
  corgis: [
    'http://i.imgur.com/uYyICl0.jpeg',
    'http://i.imgur.com/useIJl6.jpeg',
    'http://i.imgur.com/LD242xr.jpeg',
    'http://i.imgur.com/Q7vn2vS.jpeg',
    'http://i.imgur.com/ZTmF9jm.jpeg',
    'http://i.imgur.com/jJlWH6x.jpeg',
		'http://i.imgur.com/ZYUakqg.jpeg',
		'http://i.imgur.com/RxoU9o9.jpeg',
  ],
  guaxinim: [
    'http://i.imgur.com/zCC3npm.jpeg',
    'http://i.imgur.com/OvxavBY.jpeg',
    'http://i.imgur.com/Z6oAGRu.jpeg',
		'http://i.imgur.com/uAlg8Hl.jpeg',
		'http://i.imgur.com/q0O0xYm.jpeg',
		'http://i.imgur.com/BrhxR5a.jpeg',
		'http://i.imgur.com/05hlAWU.jpeg',
		'http://i.imgur.com/HAeMnSq.jpeg',
  ],
  default: [
    'http://blog.uprinting.com/wp-content/uploads/2011/09/Cute-Baby-Pictures-29.jpg',
  ],
};
