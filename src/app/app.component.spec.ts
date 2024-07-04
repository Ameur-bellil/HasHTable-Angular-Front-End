
import { TestBed } from "@angular/core/testing";
import { AppComponent } from './app.component';

// @ts-ignore
describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  // @ts-ignore
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    // @ts-ignore
    expect(app).toBeTruthy();
  });

  // @ts-ignore
  it(`should have the 'hashtable' title`, () => {

  });

  // @ts-ignore
  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // @ts-ignore
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, hashtable');
  });
});
function expect(_app: any) {
  throw new Error("Function not implemented.");
}

function beforeEach(_arg0: () => Promise<void>) {
  throw new Error("Function not implemented.");
}

