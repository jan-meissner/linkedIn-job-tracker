const deleteDatabase = document.getElementById('deleteDatabase');

deleteDatabase.addEventListener('click', function() {
    chrome.storage.local.remove('linkedInSeenJobs');
});
