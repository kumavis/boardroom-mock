var fs = require('fs')
var jade = require('jade')

// render main

var TEMPLATES = {
  main: jade.compile(fs.readFileSync('./templates/main.jade').toString()),
  home: jade.compile(fs.readFileSync('./templates/home.jade').toString()),
  
  offers: jade.compile(fs.readFileSync('./templates/offers.jade').toString()),
  offer: jade.compile(fs.readFileSync('./templates/offer.jade').toString()),
  
  boards: jade.compile(fs.readFileSync('./templates/boards.jade').toString()),
  board: jade.compile(fs.readFileSync('./templates/board.jade').toString()),
  
  not_found: jade.compile(fs.readFileSync('./templates/not_found.jade').toString()),
}

// its global baby
var APP_STATE = window.APP_STATE = {
  boards: {
    vapor: {
      key: 'vapor',
      name: 'Vapor DAO',
      proposals: [
        {
          name: 'Make public offer (chunk)',
          type: 'Offer Proposal',
          by: 'Aaron Davis',
          value: '20%',
          votes: '3/3',
          state: 'won',
        },{
          name: 'Review proposed offer',
          type: 'Offer Review',
          by: 'Ed Snow',
          value: '20%',
          votes: '0/3',
          state: 'vote',
        },
      ],
    },
  },
  offers: {
    vapor: {
      key: 'vapor',
    },
  },
}

// setup navigation

$(document.body).on('click', '.btn-nav', function(){
  var target = $(event.target).data('target')
  render(target)
})

// render app

// render('main')
// render('main|offers')
render('main|boards|board:boards.vapor')


// util

function render(viewName){
  // redirect
  if (viewName === 'main') viewName = 'main|home'
  // build stack
  var stack = viewName ? viewName.split('|') : APP_STATE.viewStack
  renderStack(stack)
}

function renderStack(stack){
  // record stack
  APP_STATE.viewStack = stack
  // clear dom
  document.body.innerHTML = ''
  stack.forEach(function(name){
      // parse view path
      var data = name.split(':')
      var templateName = data[0]
      var dataPath = data[1]
      var template = TEMPLATES[templateName] || TEMPLATES['not_found']
      var context = lookupByPath(APP_STATE, dataPath)
      // render into container
      var container = $('.template-yield')[0] || document.body
      container.innerHTML = template(context)
    })
}

function lookupByPath(obj, path) {
  var result = obj
  if (!path) return result
  // walk out path
  var stack = path.split('.')
  stack.forEach(function(segment){
    result = result[segment]
  })
  return result
}

// global action handlers? ah naw!

window.createProposal = function(board){
  var newProp = {
    by: 'Aaron Davis',
    votes: '0/3',
    state: 'vote',
  }
  $('.form-control').each(function(){
    var key = $(this).data('key')
    var value = $(this).val()
    newProp[key] = value
  })
  board.proposals.push(newProp)
  // re-render
  render()
}