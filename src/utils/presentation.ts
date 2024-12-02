import PptxGenJS from 'pptxgenjs';
import logger from './logger';

export class PresentationFormatter{
    private readonly MAX_WORDS_PER_SLIDE = 75;
    private readonly MAX_LINES_PER_SLIDE = 8;

    private readonly FONT_SIZES = {
        title: 24,
        subtitle: 20,
        body: 18
    };

    private readonly FONTS = ['Arial', 'Calibri', 'Helvetica'];
    private readonly COLOR_PALETTE = {
        background: 'FFFFFF', // White
        text: '000000',       // Black
        accent: '4A90E2'      // Blue accent
    };

    async generateProfessionalPresentation(
        topic: string, 
        content: string, 
        presentationDuration: number
    ): Promise<string> {
        try {
            const pptx = new PptxGenJS();
            pptx.layout = 'LAYOUT_16x9';

            this.createTitleSlide(pptx, topic);

            // Determine optimal slide count based on presentation duration
            const slideCount = this.calculateIdealSlideCount(presentationDuration);

            // Content Segmentation
            const contentSegments = this.intelligentContentSegmentation(
                content, 
                slideCount
            );

            // Generate Content Slides
            contentSegments.forEach((segment, index) => {
                this.createContentSlide(
                    pptx, 
                    topic, 
                    segment, 
                    index + 1
                );
            });

            // Conclusion Slide
            this.createConclusionSlide(pptx, topic);

            // Generate unique filename
            const filename = `presentation_${Date.now()}.pptx`;
            
            // Write file
            pptx.writeFile({ fileName: filename });

            return filename;
        } catch (error) {
            logger.error('Advanced presentation generation error', { topic, error });
            throw new Error('Failed to generate professional presentation');
        }
    }

    private createTitleSlide(pptx: PptxGenJS, topic: string) {
        const slide = pptx.addSlide();
        
        // Large, centered title
        slide.addText(topic, {
            x: '10%',
            y: '40%',
            w: '80%',
            fontSize: this.FONT_SIZES.title,
            color: this.COLOR_PALETTE.text,
            align: 'center',
            fontFace: this.FONTS[0]
        });

        // Optional: Add subtle background or logo placement
    }

    private createContentSlide(
        pptx: PptxGenJS, 
        topic: string, 
        content: string, 
        slideNumber: number
    ) {
        const slide = pptx.addSlide();

        // Slide Header
        slide.addText(`${topic} - Section ${slideNumber}`, {
            x: '10%',
            y: '5%',
            fontSize: this.FONT_SIZES.subtitle,
            color: this.COLOR_PALETTE.accent,
            fontFace: this.FONTS[1]
        });

        // Content with bullet points
        const bulletPoints = this.breakIntoBulletPoints(content);
        
        slide.addText(bulletPoints as any , {
            x: '10%',
            y: '15%',
            w: '80%',
            fontSize: this.FONT_SIZES.body,
            color: this.COLOR_PALETTE.text,
            fontFace: this.FONTS[2],
            bullet: true,
            wrap: true
        });
    }

    private createConclusionSlide(pptx: PptxGenJS, topic: string) {
        const slide = pptx.addSlide();
        
        slide.addText('Conclusion', {
            x: '10%',
            y: '30%',
            fontSize: this.FONT_SIZES.title,
            color: this.COLOR_PALETTE.accent,
            align: 'center'
        });

        slide.addText('Key Takeaways', {
            x: '10%',
            y: '40%',
            fontSize: this.FONT_SIZES.subtitle,
            color: this.COLOR_PALETTE.text,
            bullet: true
        });
    }

    private calculateIdealSlideCount(presentationDuration: number): number {
        // Map presentation duration to ideal slide count
        if (presentationDuration <= 10) return 7;
        if (presentationDuration <= 30) return 15;
        return 20;
    }

    private intelligentContentSegmentation(
        content: string, 
        slideCount: number
    ): string[] {
        const words = content.split(/\s+/);
        const segments: string[] = [];
        
        // Intelligent segmentation considering topic coherence
        const wordsPerSegment = Math.ceil(words.length / (slideCount - 2)); // -2 for title and conclusion

        for (let i = 0; i < slideCount - 2; i++) {
            const start = i * wordsPerSegment;
            const end = start + wordsPerSegment;
            segments.push(words.slice(start, end).join(' '));
        }

        return segments;
    }

    private breakIntoBulletPoints(content: string): string[] {
        const words = content.split(/\s+/);
        const bulletPoints: string[] = [];
        
        // Break into 3-5 bullet points, respecting word limit
        const pointCount = Math.min(5, Math.ceil(words.length / 15));
        const wordsPerPoint = Math.ceil(words.length / pointCount);

        for (let i = 0; i < pointCount; i++) {
            const start = i * wordsPerPoint;
            const end = start + wordsPerPoint;
            bulletPoints.push(words.slice(start, end).join(' '));
        }

        return bulletPoints;
    }
}