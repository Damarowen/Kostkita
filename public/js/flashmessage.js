
const find_alert = document.querySelector('.alert')

if(find_alert) {
  function alert () {
    const alert = document.querySelector('.alert')
    alert.style.display='none'
  }
 
  window.setTimeout(alert,3000)
  console.log(alert)
}