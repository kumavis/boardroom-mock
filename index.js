var fs = require('fs')
var jade = require('jade')


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
APP_STATE = {
  boards: {
    vapor: {
      key: 'vapor',
      name: 'Vapor DAO',
      budget: 3000,
      proposals: [
        {
          name: 'Elect Initial Chairperson',
          type: 'New Chair',
          by: 'Aaron Davis',
          value: 'Aaron Davis',
          votes: '3/3',
          state: 'won',
        }, {
          name: 'Hire Design Work',
          type: 'Other',
          by: 'Joel Dietz',
          value: '1000 USD',
          votes: '3/3',
          state: 'won',
        },
        // {
        //   name: 'Make public offer (chunk)',
        //   type: 'Public Offer',
        //   by: 'Aaron Davis',
        //   value: '20%',
        //   votes: '3/3',
        //   state: 'won',
        // },{
        //   name: 'Review proposed offer',
        //   type: 'Offer Review',
        //   by: 'Ed Snow',
        //   value: '20%',
        //   votes: '0/3',
        //   state: 'vote',
        // },
      ],
      chairPerson: 'Aaron Davis',
      members: [
        {
          name: 'Aaron Davis',
          holdings: 64,
        }, {
          name: 'Joel Dietz',
          holdings: 18,
        }, {
          name: 'Martin Becze',
          holdings: 18,
        }
      ],
    },
  },
  offers: {},
}

// setup navigation

$(document.body).on('click', '.btn-nav', function(){
  var target = $(event.target).data('target')
  render(target)
})

// render app

render('main')
// render('main|offers')
// render('main|boards|board:boards.vapor')


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

function handlePublicOffer(board, prop) {
  APP_STATE.offers.vapor = { key: 'vapor' }
}

// global action handlers? ah naw!
var window = (0,eval)('window')

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
  if (newProp.type === 'Public Offer') {
    handlePublicOffer(board, newProp)
  }
  // abort if no name
  if (!newProp.name || !newProp.type) return
  // add new prop
  board.proposals.push(newProp)
  // re-render
  render()
}

window.takeOffer = function(key) {
  var board = APP_STATE.boards[key]
  // close offer
  delete APP_STATE.offers[key]
  // create review prop
  var newProp = {
    name: 'Review proposed offer',
    type: 'Offer Review',
    by: 'BoardRoom',
    value: '20%',
    votes: '2/3',
    state: 'vote',
  }
  board.proposals.push(newProp)
  // close offer proposal prop
  var offerProp = board.proposals.filter(function(prop){
    return prop.type === 'Public Offer' && prop.state === 'vote'
  })[0]
  offerProp.votes = '3/3'
  offerProp.state = 'won'
  // navigate to board
  render('main|boards|board:boards.'+key)
}

window.handleProposalAction = function(board, propIndex) {
  var prop = board.proposals[propIndex]
  if (prop.type !== 'Offer Review') return
  // close offer review prop
  var offerProp = board.proposals.filter(function(prop){
    return prop.type === 'Offer Review' && prop.state === 'vote'
  })[0]
  offerProp.votes = '3/3'
  offerProp.state = 'won'
  // update cap table
  board.members.forEach(function(member){
    member.holdings -= member.holdings * 0.2
  })
  // add yco
  board.members.push({
    name: 'Y Combinator',
    holdings: 20,
  })
  // update budget
  board.budget += 100000 // 100k usd
  render()
}