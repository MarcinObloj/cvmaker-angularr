import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
@Component({
  selector: 'app-faq',
  imports: [MatExpansionModule,CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  faqs = [
    {
      question: 'Jak mogę utworzyć nowe CV?',
      answer: 'Aby utworzyć nowe CV, kliknij przycisk "Utwórz nowe CV" na stronie głównej i postępuj zgodnie z instrukcjami.'
    },
    {
      question: 'Czy mogę edytować moje CV po jego utworzeniu?',
      answer: 'Tak, możesz edytować swoje CV w dowolnym momencie, przechodząc do sekcji "Moje CV" i wybierając CV, które chcesz edytować.'
    },
    {
      question: 'Jak mogę pobrać moje CV?',
      answer: 'Aby pobrać swoje CV, przejdź do sekcji "Moje CV", wybierz CV, które chcesz pobrać, i kliknij przycisk "Pobierz".'
    },
    {
      question: 'Czy moje dane są bezpieczne?',
      answer: 'Tak, dbamy o bezpieczeństwo Twoich danych i stosujemy odpowiednie środki ochrony, aby zapewnić ich poufność.'
    }
  ];
}
