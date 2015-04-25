console.log('ready')

setupNavigation('landing')
setupNavigation('board-vapor')
setupNavigation('board-new')

function setupNavigation(name) {
  $('.btn-'+name).on('click', function(){
    $('.primary-content').removeClass('active-primary-content')
    $('.content-'+name).addClass('active-primary-content')
  })  
}