package p13.times;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjuster;
import java.time.temporal.TemporalAdjusters;

/**[API]
 * java.time패키지
 * 
 **/
public class DatetimeChangeExample {
	public static void main(String[] args) {
		//객체
		LocalDateTime now = LocalDateTime.now();
		System.out.println("현재시간: "+now);
		
		LocalDateTime targetDateTime = null;
		//상대적이 아닌 절대적 값을 적용하여 변경하는 메소드
		//with+(년,월,일,요일,시,분,초)
		targetDateTime = now.withYear(2024)/*2024년*/.withMonth(10)/*10월*/.withDayOfMonth(5)/*5일*/.withHour(13)/*13시*/; //값들을 직접적으로 지정.. 더하거나 빼는게 아님
		System.out.println("결과: "+targetDateTime);
		//년도의 상대 변경
		targetDateTime = now.with(TemporalAdjusters.firstDayOfYear());
		System.out.println("올해 첫 일: " + targetDateTime);
		targetDateTime = now.with(TemporalAdjusters.lastDayOfYear());
		System.out.println("올해의 마지막 일: "+ targetDateTime);
		targetDateTime = now.with(TemporalAdjusters.firstDayOfNextYear());
		System.out.println("내년의 첫 일: " + targetDateTime);
		
		//월의 상대 변경
		targetDateTime = now.with(TemporalAdjusters.firstDayOfMonth());
		System.out.println("이달의 첫 일: " + targetDateTime);
		targetDateTime = now.with(TemporalAdjusters.lastDayOfMonth());
		System.out.println("이달의 마지막 일: "+ targetDateTime);
		targetDateTime = now.with(TemporalAdjusters.firstDayOfNextMonth());
		System.out.println("다음달의 첫 일: " + targetDateTime);
		
		//요일의 상대변경
		targetDateTime = now.with(TemporalAdjusters.firstInMonth(DayOfWeek.MONDAY));
		System.out.println("이달의 첫 월요일: " + targetDateTime);
		targetDateTime = now.with(TemporalAdjusters.next(DayOfWeek.THURSDAY));
		System.out.println("돌아오는 목요일: "+ targetDateTime);
		targetDateTime = now.with(TemporalAdjusters.previous(DayOfWeek.MONDAY));
		System.out.println("지난 월요일: " + targetDateTime);
	}
}
