$(document).ready(function () {
  $("table").DataTable();
});

/*
    var stores = <%-JSON.stringify(stores) %>;
         // console.log("test :"+test);


  function displaySort(){
    console.log(stores);
    var temp ='';
    stores.forEach(function (store) {
      temp += `<tr><td><img src='/uploads/${store.image}' /><td><td><a href='/store/${store.id}>${store.name}</a></td><td>${store.zipcode}</td><td>${store.status}</td></tr>`;
    });

    $('#stores-listing tbody').append(temp);
  }
  */
