export function formatDate(date: string): string {
  const [year, month, day] = date.split(" ")[0].split("-");

  const months = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  return `${day} ${months[Number(month) - 1]} ${year}`;
}