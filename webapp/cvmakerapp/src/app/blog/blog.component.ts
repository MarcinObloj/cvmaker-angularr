import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogSection } from '../model/blogsection.model';

@Component({
  selector: 'app-blog',
  imports: [RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss'
})
export class BlogComponent {
  blogSections: BlogSection[] = [
    {
      heading: '1. Nagłówek',
      description: 'Nagłówek to pierwsza sekcja Twojego CV i powinien zawierać Twoje imię i nazwisko, adres, numer telefonu oraz e-mail. To podstawowa informacja kontaktowa, dlatego musi być czytelna i profesjonalna.',
    },
    {
      heading: '2. Podsumowanie zawodowe',
      description: 'Podsumowanie to krótki opis Twojego doświadczenia zawodowego i umiejętności. Skup się na tym, co możesz zaoferować pracodawcy i podkreśl swoje najważniejsze osiągnięcia.',
    },
    {
      heading: '3. Doświadczenie zawodowe',
      description: 'Wymień poprzednie miejsca pracy, zaczynając od najnowszego. Każda pozycja powinna zawierać nazwę firmy, stanowisko, okres zatrudnienia oraz krótki opis obowiązków i osiągnięć.',
    },
    {
      heading: '4. Wykształcenie',
      description: 'Podaj swoje wykształcenie, zaczynając od najwyższego poziomu. Wymień nazwę uczelni, kierunek studiów oraz okres nauki.',
    },
    {
      heading: '5. Umiejętności',
      description: 'W tej sekcji możesz wyeksponować swoje kluczowe kompetencje. Możesz dodać również poziom zaawansowania w poszczególnych umiejętnościach.',
    },
    {
      heading: '6. Kursy i certyfikaty',
      description: 'Jeśli posiadasz ukończone kursy lub zdobyte certyfikaty, które mogą być istotne dla przyszłego pracodawcy, wymień je w tej części.',
    },
    {
      heading: '7. Języki',
      description: 'Wymień języki obce oraz poziom ich znajomości, używając standardowych oznaczeń A1, A2, B1, B2, C1, C2.',
    },
    {
      heading: '8. Hobby',
      description: 'Choć sekcja o hobby może wydawać się mniej istotna, pozwala lepiej poznać kandydata. Wybierz zainteresowania, które mogą odzwierciedlać Twoje umiejętności lub wartości.',
    },
  ];
}
