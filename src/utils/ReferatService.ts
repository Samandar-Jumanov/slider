import { mockData } from "./constant";


/**
 *    This is being used for each page 
 *    It is creating a new page for a current file 
 * 

// This should include current page requirements 
// For current content requirements

// Should it have a quality check ? 

 *     
 */

export default class ReferatService {
    async createMockReferat() {
        const content = mockData ;
        const fileName = 'referat.txt';
        return { content, fileName };
    }
}
