# @axis-backstage/plugin-jira-dashboard-backend

## 1.0.0

### Major Changes

- 9456530: Updated the getIssuesByFilter function to accept an array of components,
  enabling the construction of more flexible JQL queries.
  Introduced a new variable named componentQuery to represent the portion of the JQL query related to components.

  Enhanced the getIssuesFromFilters function to include support for filtering by components.
  Now, along with project keys and filters, the function also accepts an array of components.
  This change allows for more comprehensive filtering options when retrieving issues from Jira.

  Modified the router implementation to pass the array of components to the getIssuesFromFilters function.
  By including components in the request, users can now specify additional criteria for filtering Jira issues,
  resulting in more refined search results.

  The introduced changes provide users with greater flexibility and control when retrieving Jira issues,
  allowing for more precise filtering based on project keys, components, and filter criteria.
  This enhancement improves the overall usability and effectiveness of the Jira integration functionality.

### Patch Changes

- Updated dependencies [517c68a]
  - @axis-backstage/plugin-jira-dashboard-common@1.0.0

## 0.7.4

### Patch Changes

- f23bacd: added content type header to searchJira call

## 0.7.3

### Patch Changes

- f3203e9: Fix dependencies in published packages

## 0.7.2

### Patch Changes

- 5bb3330: Added and exported a function `searchJira` that searches for Jira issues using
  JQL. This can be used outside this plugin to search for issues. For more information about the available options see the API documentation at
  [issue search](https://developer.atlassian.com/cloud/jira/platform/rest/v2/api-group-issue-search/#api-rest-api-2-search-post).

## 0.7.1

### Patch Changes

- ae965c0: Fix broken workspace dependencies

## 0.7.0

### Minor Changes

- 135e3b2: Updated the resolveUserEmailSuffix function to utilize config.getOptionalString method, providing a more concise approach. This modification ensures that an empty string is returned if the Jira user email suffix configuration is missing, effectively preventing failures and enhancing error logging capabilities.

  Modified the retrieval of project keys in the router module to handle multiple project keys specified in annotations for e.g., jira.com/project-key: abc,def,ghi
  The updated logic now parses multiple project keys properly and supports comma-separated values. It's important to note that in cases where multiple project keys are present, only the first project key (projectKey[0]) is used for display on the project card i.e, in this case project-key "abc", assuming it represents the main project. However, the response table will include data from all project keys specified in the annotations.

## 0.6.0

### Minor Changes

- 33497c0: Dashboard and Avatar backend APIs adjusted to consume entityRef as /:kind/:namespace/:name. Fixes a 404 routing issue where a proxy like oauth2Proxy could decode the URI encoded path parameter /:entityRef known to contain the reserved path delimiter '/'.

### Patch Changes

- d45e6cb: The Jira Dashboard backend now also looks for the `/component`-annotation, in order to support Roadies annotation.
- 3adbfd1: Fix inaccuracy in config documentation in README.md

## 0.5.0

### Minor Changes

- 97f5bf4: Created optional ANNOTATION_PREFIX config in backend to make it possible to define custom annotations. The jira.com annotation is still used if no config value is provided. Also removed check for annotation in frontend and only return error message 'Could not fetch Jira Dashboard content for defined project key' if no Jira data is returned from backend.

### Patch Changes

- Updated dependencies [97f5bf4]
  - @axis-backstage/plugin-jira-dashboard-common@0.4.0

## 0.4.0

### Minor Changes

- 864d983: Bumped Backstage version to v.1.22.0

### Patch Changes

- 1248d02: Removed the single quotes from documentation config strings
- Updated dependencies [864d983]
  - @axis-backstage/plugin-jira-dashboard-common@0.3.0

## 0.3.0

### Minor Changes

- 23ff76a: Bumped Backstage version to v.1.21.0 in whole monorepo

### Patch Changes

- Updated dependencies [23ff76a]
  - @axis-backstage/plugin-jira-dashboard-common@0.2.0

## 0.2.0

### Minor Changes

- a67c963: Bumped Backstage to version 1.20.3

### Patch Changes

- 1e7ee53: Added missing config.d.ts file to package.json
- Updated dependencies [9cf5ab1]
  - @axis-backstage/plugin-jira-dashboard-common@0.1.1
