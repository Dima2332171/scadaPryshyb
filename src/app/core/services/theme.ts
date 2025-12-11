import {Injectable, Renderer2, RendererFactory2} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Theme {
  private renderer: Renderer2;
  private currentTheme: string = 'light-theme';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadTheme();
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  toggleTheme():void {
    if (this.currentTheme === 'light-theme') {
      this.setTheme('dark-theme');
    } else {
      this.setTheme('light-theme');
    }
  }

  setTheme(theme: string): void {
    this.renderer.removeClass(document.body, this.currentTheme);
    this.renderer.addClass(document.body, theme);
    this.currentTheme = theme;
    localStorage.setItem('app-theme', theme);
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme(this.currentTheme);
    }
  }
}
