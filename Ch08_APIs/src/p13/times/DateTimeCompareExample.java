package p13.times;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.temporal.ChronoUnit;

/**[API]
 * java.time패키지
 * 날짜 시간 비교
 **/
public class DateTimeCompareExample {
	public static void main(String[] args) {
		LocalDateTime startDateTime = LocalDateTime.of(2023, 1,1,9,0,0);
		System.out.println("시작시간: "+startDateTime);
		LocalDateTime endDateTime = LocalDateTime.of(2024, 3,31,18,0,0);
		System.out.println("종료시간: "+endDateTime);
		System.out.println("[종료까지 남은 시간]");
		long remainYear = startDateTime.until(endDateTime, ChronoUnit.YEARS);
		long remainMonth = startDateTime.until(endDateTime, ChronoUnit.MONTHS);
		long remainDay = startDateTime.until(endDateTime, ChronoUnit.DAYS);
		long remainHour = startDateTime.until(endDateTime, ChronoUnit.HOURS);
		long remainMinute = startDateTime.until(endDateTime, ChronoUnit.MINUTES);
		long remainSecond = startDateTime.until(endDateTime, ChronoUnit.SECONDS);
		
		System.out.println("남은해: " + remainYear);
		System.out.println("남은월: " + remainMonth);
		System.out.println("남은일: " + remainDay);
		System.out.println("남은시: " + remainHour);
		System.out.println("남은분: " + remainMinute);
		System.out.println("남은초: " + remainSecond);
		
		//between()메소드는 차이를 전체로 계산해서 출력
		remainYear = ChronoUnit.YEARS.between(startDateTime, endDateTime); //between은 시작과 종료를 매개변수로 받음
		remainMonth = ChronoUnit.MONTHS.between(startDateTime, endDateTime);
		remainDay = ChronoUnit.DAYS.between(startDateTime, endDateTime);
		remainHour = ChronoUnit.HOURS.between(startDateTime, endDateTime);
		remainMinute = ChronoUnit.MINUTES.between(startDateTime, endDateTime);
		remainSecond = ChronoUnit.SECONDS.between(startDateTime, endDateTime);
		
		System.out.println("남은해: " + remainYear);
		System.out.println("남은월: " + remainMonth);
		System.out.println("남은일: " + remainDay);
		System.out.println("남은시: " + remainHour);
		System.out.println("남은분: " + remainMinute);
		System.out.println("남은초: " + remainSecond);
		
		System.out.println("[종료까지 남은 기간]");
		Period period = Period.between(startDateTime.toLocalDate(), endDateTime.toLocalDate());
		System.out.println("남은 기간: " + period.getYears()+"년");
		System.out.println(period.getMonths()+"달");
		System.out.println(period.getDays()+"일");
		
	}
}
