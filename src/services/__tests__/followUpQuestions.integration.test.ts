import { describe, it, expect } from 'vitest';
import { getQuestionCategories } from '../followUpQuestionsService';

describe('Follow-up Questions Integration', () => {
  it('should have predefined question categories', () => {
    const categories = getQuestionCategories();
    
    expect(categories).toHaveLength(6);
    
    // Verify all expected categories exist
    const categoryIds = categories.map(cat => cat.id);
    expect(categoryIds).toContain('business_model');
    expect(categoryIds).toContain('market');
    expect(categoryIds).toContain('financials');
    expect(categoryIds).toContain('team');
    expect(categoryIds).toContain('growth');
    expect(categoryIds).toContain('general');
    
    // Verify each category has questions
    categories.forEach(category => {
      expect(category.questions.length).toBeGreaterThan(0);
      expect(category.name).toBeTruthy();
      expect(category.description).toBeTruthy();
    });
  });

  it('should have business model questions', () => {
    const categories = getQuestionCategories();
    const businessModel = categories.find(cat => cat.id === 'business_model');
    
    expect(businessModel).toBeDefined();
    expect(businessModel?.questions).toContain('How do you plan to monetize your product in the first year?');
    expect(businessModel?.questions).toContain('What are your key revenue streams and which is most important?');
  });

  it('should have market questions', () => {
    const categories = getQuestionCategories();
    const market = categories.find(cat => cat.id === 'market');
    
    expect(market).toBeDefined();
    expect(market?.questions).toContain('What is your total addressable market size?');
    expect(market?.questions).toContain('Who are your main competitors and how do you differentiate?');
  });

  it('should have financial questions', () => {
    const categories = getQuestionCategories();
    const financials = categories.find(cat => cat.id === 'financials');
    
    expect(financials).toBeDefined();
    expect(financials?.questions).toContain('What are your revenue projections for the next 3 years?');
    expect(financials?.questions).toContain('How much funding do you need and what will you use it for?');
  });

  it('should have team questions', () => {
    const categories = getQuestionCategories();
    const team = categories.find(cat => cat.id === 'team');
    
    expect(team).toBeDefined();
    expect(team?.questions).toContain('What key hires do you need to make in the next 12 months?');
    expect(team?.questions).toContain('How does your team\'s background prepare you for this challenge?');
  });

  it('should have growth questions', () => {
    const categories = getQuestionCategories();
    const growth = categories.find(cat => cat.id === 'growth');
    
    expect(growth).toBeDefined();
    expect(growth?.questions).toContain('What is your customer acquisition strategy?');
    expect(growth?.questions).toContain('How do you plan to scale your marketing efforts?');
  });

  it('should have general questions', () => {
    const categories = getQuestionCategories();
    const general = categories.find(cat => cat.id === 'general');
    
    expect(general).toBeDefined();
    expect(general?.questions).toContain('What is your long-term vision for the company?');
    expect(general?.questions).toContain('What would success look like in 5 years?');
  });
});