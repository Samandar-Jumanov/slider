import { mockData } from "./constant";


// This is creating new page 
// For current content 


// This should include current page requirements 
// For current content requirements

// Should it have a quality check ? 


export default class PresentationService {
    async createMockPresentation() {
        const content = mockData;
        const fileName = 'presentation.pptx';
        return { content, fileName };
    }
}
