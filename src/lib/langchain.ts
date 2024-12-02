import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";

export enum ContentType {
  INDEPENDENT_WORK = "independent_work",
  REFERAT = "referat",
  SLIDE  = "slide"
}

interface ContentGenerationOptions {
  type: ContentType;
  theme: string;
  completedSections?: string[];
  existingContent?: Record<string, string>;
}

interface ContentProgress {
  type: ContentType;
  theme: string;
  completedSections: string[];
  pendingSections: string[];
  currentSection?: string;
  generatedContent: Record<string, string>;
}

class ContentGenerator {
  private llm: ChatOpenAI;
  private memory: BufferMemory;
  private contentProgress: ContentProgress | null = null;

  constructor(modelName: string = "gpt-4-turbo", temperature: number = 0.7) {
    this.llm = new ChatOpenAI({
      modelName,
      temperature
    });

    this.memory = new BufferMemory({
      memoryKey: "chat_history",
      returnMessages: true
    });
  }

  // Method to initialize content generation
  async initializeContentGeneration(options: ContentGenerationOptions): Promise<string[]> {
    const initChain = new LLMChain({
      llm: this.llm,
      prompt: new PromptTemplate({
        template: `
          You are a content generation assistant. 
          Generate a structured list of sections/steps for a {type} on the theme "{theme}".
          
          Considerations:
          - Ensure a logical, comprehensive structure
          - Each section should build upon previous ones
          
          Provide a detailed list of recommended sections.
        `,
        inputVariables: ['type', 'theme']
      })
    });

    const result = await initChain.call({ 
      type: options.type,
      theme: options.theme, 
      
    });

    // Parse the suggested sections
    const suggestedSections = result.text.split('\n')
      .filter(( section : string ) => section.trim() !== '')
      .map(( section : string ) => section.replace(/^\d+\.\s*/, '').trim());

    // Initialize content progress
    this.contentProgress = {
      type: options.type,
      theme: options.theme,
      completedSections: options.completedSections || [],
      pendingSections: suggestedSections,
      generatedContent: options.existingContent || {}
    };

    return suggestedSections;
  }

  // Method to generate content for the next section
  async generateNextSectionContent(section: string): Promise<string> {
    if (!this.contentProgress) {
      throw new Error("Content generation not initialized. Call initializeContentGeneration first.");
    }

    const sectionGenerationChain = new LLMChain({
      llm: this.llm,
      prompt: new PromptTemplate({
        template: `
          You are creating a {type} on the theme "{theme}".
          
          Previous completed sections: {completedSections}
          
          Current section to generate: {section}
          
          Existing content context: {existingContent}
          
          Generate detailed, comprehensive content for this section:
          - Ensure logical flow with previous sections
          - Maintain academic/professional tone appropriate for {type}
          - Provide in-depth, well-structured content
        `,
        inputVariables: ['type', 'theme', 'completedSections', 'section', 'existingContent']
      })
    });

    const result = await sectionGenerationChain.call({
      type: this.contentProgress.type,
      theme: this.contentProgress.theme,
      completedSections: this.contentProgress.completedSections.join(', '),
      section: section,
      existingContent: JSON.stringify(this.contentProgress.generatedContent)
    });

    // Update content progress
    this.contentProgress.completedSections.push(section);
    this.contentProgress.pendingSections = this.contentProgress.pendingSections.filter(s => s !== section);
    this.contentProgress.currentSection = section;
    this.contentProgress.generatedContent[section] = result.text;

    return result.text;
  }


  async getOverall ( generatedContent: string ) {
    if (!generatedContent) {
           throw new Error("Content generation not initialized. Call initializeContentGeneration first.");
      }
  
      const imageDescription = new LLMChain({
        llm: this.llm,
        prompt: new PromptTemplate({
          template: `
               I need overall meaning of a content 
                {generatedContent}

                 - Ensure words is being used to find related images
                  - It must not be long than 4 words 
          `,
          inputVariables: [`generatedContent`]
        })
      });


      const res = await imageDescription.call(generatedContent)
      return res.text
    }


  // Method to get current content progress
  getContentProgress(): ContentProgress | null {
    return this.contentProgress ? { ...this.contentProgress } : null;
  }

  // Method to reset content progress
  resetContentProgress() {
    this.contentProgress = null;
  }


}

export default ContentGenerator;