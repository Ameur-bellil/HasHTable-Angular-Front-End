import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HashTableService} from './HashTableService';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [HashTableService],
  imports: [
    FormsModule
  ],
  // Moved providers into the @Component decorator
  standalone: true
})
export class AppComponent implements OnInit {

  @ViewChild('canvas', {static: true}) canvas!: ElementRef<HTMLCanvasElement>; // Added type assertion for canvas
  private ctx!: CanvasRenderingContext2D;
  table: Array<string>[] = new Array(10).fill(null).map(() => []); // Corrected type annotation

  private animatingKey: string | null = null;
  private animatingIndex = -1;
  private animatingChainPosition = -1;
  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private targetY = 0;
  private movingToIndex = true;
  private animationStep = 0;
  private animationRequestId: number | null = null;

  private CELL_WIDTH = 100;
  private CELL_HEIGHT = 30;
  private PADDING = 5;
  private ANIMATION_STEPS = 20;

  newWord = '';
  searchResult: boolean | null = null;


  constructor(private hashTableService: HashTableService) {}

  ngOnInit(): void {
    const canvasElement = this.canvas.nativeElement;
    this.ctx = canvasElement.getContext('2d')!;
    this.drawRect();
  }

  hashFunction(key: string): number {
    let hashValue = 0;
    for (let i = 0; i < key.length; i++) {
      hashValue = (hashValue + key.charCodeAt(i)) * 31;
    }
    return Math.abs(hashValue % 10);
  }

  addWord(): void {
    console.log(this.newWord);
    this.hashTableService.addWord(this.newWord).subscribe(() => {
      console.log(`Word added: ${this.newWord}`);
      this.startAnimation(this.newWord, this.hashFunction(this.newWord) ); // Call drawRect() after word is added
    });
  }


  removeWord(): void {
    if (this.newWord.trim() !== '') {
      this.hashTableService.removeWord(this.newWord.trim()).subscribe(() => {
        console.log(`Word removed: ${this.newWord}`);
        const index = this.hashFunction(this.newWord);
        const wordIndex = this.table[index].indexOf(this.newWord);

        if (wordIndex !== -1) {
          this.table[index].splice(wordIndex, 1);
          this.drawRect(); // Redraw canvas after removing the word
        }
      });
    }
  }


  searchWord(): void {
    if (this.newWord.trim() !== '') {
      this.hashTableService.searchWord(this.newWord.trim()).subscribe((result: boolean | null) => {
        this.searchResult = result;
        console.log(`Search result for ${this.newWord}: ${this.searchResult}`);
      });
    } else {
      this.searchResult = null;
    }
  }


  drawRect(): void {
    const canvas = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < this.table.length; i++) {
      let x = this.PADDING;
      const y = i * (this.CELL_HEIGHT + this.PADDING) + this.PADDING;

      this.ctx.strokeStyle = 'black';
      this.ctx.strokeRect(x, y, this.CELL_WIDTH, this.CELL_HEIGHT);
      this.ctx.strokeText(String(i), x + this.PADDING, y + this.CELL_HEIGHT / 2 + this.PADDING);


      for (let j = 0; j < this.table[i].length; j++) {

        const previousX = x;
        x += this.CELL_WIDTH + this.PADDING;
        this.ctx.strokeRect(x, y, this.CELL_WIDTH, this.CELL_HEIGHT);
        this.ctx.strokeText(this.table[i][j], x + this.PADDING, y + this.CELL_HEIGHT / 2 + this.PADDING);
        this.ctx.beginPath();
        this.ctx.moveTo(previousX + this.CELL_WIDTH, y + this.CELL_HEIGHT / 2);
        this.ctx.lineTo(x, y + this.CELL_HEIGHT / 2);
        this.ctx.stroke();
      }

      if (this.table[i].length > 0) {
        const previousX = x;
        x += this.CELL_WIDTH + this.PADDING;
        this.ctx.beginPath();
        this.ctx.moveTo(previousX + this.CELL_WIDTH, y + this.CELL_HEIGHT / 2);
        this.ctx.lineTo(x, y + this.CELL_HEIGHT / 2);
        this.ctx.stroke();

        // Drawing the additional lines
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + this.PADDING);
        this.ctx.lineTo(x, y + this.CELL_HEIGHT - this.PADDING - 5);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x, y + this.PADDING);
        this.ctx.lineTo(x, y + this.CELL_HEIGHT - this.PADDING - 5 + 11);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x, y + this.PADDING);
        this.ctx.lineTo(x, y + this.CELL_HEIGHT - this.PADDING - 15);
        this.ctx.stroke();

        // Draw the diagonal lines
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + this.PADDING);
        this.ctx.lineTo(x + 10, y + this.CELL_HEIGHT - this.PADDING);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y + this.PADDING + 20);
        this.ctx.lineTo(x, y + this.CELL_HEIGHT - this.PADDING);
        this.ctx.stroke();
      }
    }

      if (this.animatingKey !== null) {
      this.ctx.fillStyle = 'red';
      this.ctx.fillText(this.animatingKey, this.currentX + this.PADDING, this.currentY + this.CELL_HEIGHT / 2 + this.PADDING);
    }
  }

  startAnimation(key: string, index: number): void {
    this.animatingKey = key;
    this.animatingIndex = index;
    this.animatingChainPosition = this.table[index].length;
    this.animationStep = 0;

    this.currentX = this.PADDING;
    this.currentY = -this.CELL_HEIGHT;
    this.targetX = this.PADDING + (this.CELL_WIDTH + this.PADDING);
    this.targetY = index * (this.CELL_HEIGHT + this.PADDING) + this.PADDING;
    this.movingToIndex = true;

    if (this.animationRequestId !== null) {
      cancelAnimationFrame(this.animationRequestId);
    }

    this.animate();
  }

  animate(): void {
    if (this.animationStep < this.ANIMATION_STEPS) {
      this.currentX += (this.targetX - this.currentX) / (this.ANIMATION_STEPS - this.animationStep + 1);
      this.currentY += (this.targetY - this.currentY) / (this.ANIMATION_STEPS - this.animationStep + 1);
      this.drawRect();
    } else {
      if (this.movingToIndex) {
        this.movingToIndex = false;
        this.animationStep = 0;
        this.targetX = this.PADDING + (this.CELL_WIDTH + this.PADDING) * (this.animatingChainPosition + 1);
      } else {
        this.currentX += (this.targetX - this.currentX) / (this.ANIMATION_STEPS - this.animationStep + 1);
        if (this.animationStep >= this.ANIMATION_STEPS) {
          if (!this.table[this.animatingIndex].includes(this.animatingKey!)) {
            this.table[this.animatingIndex].push(this.animatingKey!);
          }
          this.animatingKey = null;
          this.drawRect();
          return;
        }
      }
    }

    this.animationStep++;
    this.animationRequestId = requestAnimationFrame(() => this.animate());
  }

}
