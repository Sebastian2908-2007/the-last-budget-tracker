const { get } = require("mongoose");

// var that holds connection
let db;
// establish a connection to 
const request = window.indexedDB.open('budget_tracker', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
request.onupgradeneeded = function(event) {
    // save referance tothedatabase
    const db = event.target.result;
    // create an objectstore (table) called new budget_tracker, set it to have an auto incrementing primary key of sorts
    db.createObjectStore('new_budget', {autoIncrement: true});
};

// upon success
request.onsuccess = function(event) {
    // when db id succesfully created with its object store (from on upgradeneeded event above) or simply established a connection, save referance to d;b in global cariable
    db = event.target.result;
    // check if app is online, if it is run upload budget() function to send all local db data to the api
    if (navigator.onLine) {
        // uploadBudget();
    }
};

request.onerror = function(event) {
    //log error rght here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new tansaction or and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions 
  const transaction = db.transaction(['new_budget'], 'readwrite')

  // access the object store for new transaction
    const transactionObjectStore = transaction.objectStore('new_budget');

    // add record to your store with add method
    transactionObjectStore.add(record);
};

function uploadBudget() {
    // open transaction on your db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access your object Store
    const budgetObjectStore = transaction.objectStore('new_budget');

    // get all records from store and set to variable
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        // if there was data in indexedDb's store lets send it to the api server
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // open one more transaction
                
            })
        }
    }
}
