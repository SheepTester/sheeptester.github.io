var xmlhttp = new XMLHttpRequest();
var url = "words.json";
xmlhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    var words = JSON.parse(this.responseText);
  }
};
xmlhttp.open("GET","words.json",true);
xmlhttp.send();
function generate() {
  var sentence=["N","V"];
}