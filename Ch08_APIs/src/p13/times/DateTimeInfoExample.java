package p13.times;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**[API]
 * java.time패키지
 * LocalDate, LocalDateTime,ZoneId, ZonedDateTime
 **/
public class DateTimeInfoExample {
	public static void main(String[] args) {
		//날짜 시간 객체 생성
		LocalDateTime now = LocalDateTime.now();
		System.out.println(now);
		
		String strDateTime = now.getYear()+"년";
		strDateTime += now.getMonthValue()+"월"; //걍 getMonth하면 월 이름이 영어로 나옴
		strDateTime += now.getDayOfMonth()+"일";
		strDateTime += now.getDayOfWeek()+" ";
		strDateTime += now.getHour()+"시";
		strDateTime += now.getMinute()+"분";
		strDateTime += now.getSecond()+"초";
		strDateTime += now.getNano()+"나노초";
		System.out.println(strDateTime);
		
		//윤년여부 확인메소드 isLeapYear();
		//LocalDateTime → LocalDate로 변경하는 메소드: toLocalDate()
		LocalDate nowDate = now.toLocalDate();
		if(nowDate.isLeapYear()) { //LocalDateTime에는 isLeapYear메소드가 없음
			System.out.println("윤년: 2월이 29일까지 있는해");
		}else {
			System.out.println("평년: 2월이 28일까지 있는해");
		}
		
	}
}
