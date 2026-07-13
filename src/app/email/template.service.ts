import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as hbs from 'handlebars';
import { join } from 'path';

@Injectable()
export class TemplateService {
  private readonly templatesDir = join(__dirname, 'templates');

  private resolveTemplatePath(templateName: string) {
    const templatePath = join(this.templatesDir, `${templateName}.hbs`);
    if (fs.existsSync(templatePath)) {
      return templatePath;
    }

    const fallbackPath = join(
      process.cwd(),
      'src',
      'app',
      'email',
      'templates',
      `${templateName}.hbs`,
    );
    if (fs.existsSync(fallbackPath)) {
      return fallbackPath;
    }

    throw new Error(
      `Template not found: ${templateName}. Tried ${templatePath} and ${fallbackPath}`,
    );
  }

  render(templateName: string, context: Record<string, any>): string {
    const templatePath = this.resolveTemplatePath(templateName);
    const source = fs.readFileSync(templatePath, 'utf8');
    const compiled = hbs.compile(source);
    return compiled(context);
  }
}
