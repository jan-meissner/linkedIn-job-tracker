// load database
DBlinkedInSeenJobs = readDatabase();

/**
 * Reads the LinkedIn seen jobs database from local storage.
 * @returns {Array} An array of seen jobs.
 */
function readDatabase() {
    let database = [];
    chrome.storage.local.get('linkedInSeenJobs', function(result) {
        database = result.linkedInSeenJobs || [];
    });
    return database;
}

/**
 * Deletes the LinkedIn seen jobs database from local storage.
 */
function deleteDatabase() {
    chrome.storage.local.remove('linkedInSeenJobs');
}

/**
 * Saves the LinkedIn seen jobs database to local storage.
 * @param {Array} database - An array of seen jobs to be saved.
 */
function saveDatabase(database) {
    chrome.storage.local.set({'linkedInSeenJobs': database});
}

/**
 * Extracts job title elements from LinkedIn job search results.
 * @returns {NodeList} A NodeList containing job title elements.
 */
function extractJobTitleElements() {
    const jobSearchResultsList = document.querySelector('div.jobs-search-results-list');
    const jobTitlesElements = jobSearchResultsList.querySelectorAll('.job-card-list__title');
    return jobTitlesElements;
}

/**
 * Greys out a job title element if it has already been seen.
 * @param {HTMLElement} jobTitleElement - The job title element to be greyed out.
 */
function greyOutSeenJob(jobTitleElement) {
    if (!isNewJob(extractJob(jobTitleElement))) {
        jobTitleElement.style.color = 'grey';
    }
}

/**
 * Extracts job information from a job title element.
 * @param {HTMLElement} jobTitleElement - The job title element to extract information from.
 * @returns {Object} An object containing job information.
 */
function extractJob(jobTitleElement) {
    const companyElement = jobTitleElement.parentNode.nextElementSibling;
    const companyName = companyElement ? companyElement.innerText : 'Unknown';
    job = {jobTitle: jobTitleElement.innerText, jobHref: jobTitleElement.href, companyName: companyName}

    return job;
}

/**
 * Checks if a job is new or has already been seen.
 * @param {Object} job - The job to be checked.
 * @returns {boolean} True if the job is new, false if it has already been seen.
 */
function isNewJob(job){
    return !DBlinkedInSeenJobs.some(existingJob => existingJob.jobTitle === job.jobTitle && existingJob.companyName === job.companyName)
}

/**
 * Calls the callback function when a new job title element is added to the DOM.
 * @param {function} callback - The function to be called when a new job title element is added.
 */
function onNewJobTitleElement(callback){
    const jobsSearchResultsList = document.querySelector('.jobs-search-results-list');

    // Define the callback function for the MutationObserver
    const obscallback = function(mutationsList, _observer) {
        for(const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.classList && addedNode.classList.contains('job-card-list__title')) {
                        callback(addedNode)                       
                    }
                }
            }
        }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(obscallback);
    const config = { attributes: false, childList: true, subtree: true };
    observer.observe(jobsSearchResultsList, config);
}

// When the window is loaded, grey out seen jobs and set up a MutationObserver to detect newly added job title elements
window.addEventListener('load', function(_event) {
    extractJobTitleElements().forEach(greyOutSeenJob);
    onNewJobTitleElement(greyOutSeenJob)
});

// Listen for clicks on job title elements and marks them as seen if they haven't been seen before.
document.body.addEventListener('click', function(event) {
    const jobTitleElementContainer = event.target.closest('.jobs-search-results__list-item');
    if (jobTitleElementContainer) {
        const jobTitleElement = jobTitleElementContainer.querySelector('.job-card-list__title');
        if (jobTitleElement) {
            const job = extractJob(jobTitleElement)
            if (isNewJob(job)) {
                DBlinkedInSeenJobs.push(job);
                saveDatabase(DBlinkedInSeenJobs);
            }
            greyOutSeenJob(jobTitleElement);
        }
    }
}); 



