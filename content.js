DBlinkedInSeenJobs = readDatabase();

console.log("LOADED")

function readDatabase() {
    return JSON.parse(localStorage.getItem('linkedInSeenJobs')) || [];
}

function deleteDatabase() {
    localStorage.removeItem('linkedInSeenJobs');
}

function saveDatabase(database) {
    localStorage.setItem('linkedInSeenJobs', JSON.stringify(database));
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

function extractJob(jobTitleElement) {
    const companyElement = jobTitleElement.parentNode.nextElementSibling;
    const companyName = companyElement ? companyElement.innerText : 'Unknown';
    job = {jobTitle: jobTitleElement.innerText, jobHref: jobTitleElement.href, companyName: companyName}

    return job;
}

function isNewJob(job){
    return !DBlinkedInSeenJobs.some(existingJob => existingJob.jobTitle === job.jobTitle && existingJob.companyName === job.companyName)
}

function greyOutSeenJob(jobTitleElement) {
    if (!isNewJob(extractJob(jobTitleElement))) {
        jobTitleElement.style.color = 'grey';
    }
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


