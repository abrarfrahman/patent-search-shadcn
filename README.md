# Task Description

### Introduction

The objective is to create an online platform where users can choose a patent, explore its details, pick specific claims, and submit their choices. Users should also have access to a history of their past selections.

### Context

Patent documents are structured similarly to academic papers, including a title, abstract, and a comprehensive description that outlines the invention. However, one key distinction is the claims section, which serves to legally define the scope of the patent’s protection. [View an example here](https://ppubs.uspto.gov/dirsearch-public/print/downloadPdf/7961663).


***NOTE:*** Dependent claims reference one "parent claim," but a single parent claim can have several dependent claims attached.

This feature will allow users to pick a patent, select its relevant claims, and submit those choices. For instance, users could need this to invalidate certain claims in a patent to avoid infringement litigation.

### Functionality

1. Users must be able to browse and select from a database of 1000 patent documents.

2. Upon selecting a document, the user must be able to view essential information about it, such as its ID, title, abstract, inventors, assignees, and filing date. Other information may also be displayed if available.

3. Once a document is chosen, the user should be able to read through and select claims listed within the patent.

### Database Schema

A PostgreSQL database has been pre-configured on the Linux server.

The table consisted of 1000 patent entries, with only the primary key being indexed. 
***NOTE FROM ABRAR ABT HIS IMPLEMENTATION:*** you'll notice my qritten queries hit a vector search index on the displayed text fields, and all the data is sourced from granted US patents filed within the past two decades.

Below is a summary of relevant fields in the table:

**id**: A unique string identifier formatted as `[country code]-[publication number]-[kind code]`. Professionals typically use the last few digits of the publication number to refer to a patent, such as "the '663 patent" for quick reference.

**description**: A long text field containing the full description of the patent, often messy and unstructured, particularly with complex formatting like formulas or tables.

**claims_xml**: This is a crucial column. To implement claim selection, you must parse this XML field to extract the individual claims and manipulate them accordingly. The XML defines each claim, the relationships between dependent and independent claims, and additional structural elements. You can refer to the [official documentation](https://www.ificlaims.com/docs/claims.htm) to better understand the structure. Feel free to skip or exclude patents that have malformed or problematic XML data.