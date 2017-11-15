package p13.times;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;

/**[API]
 * java.time패키지(JAVA8에서 추가)
 **/
public class DateTimeCreateExample {
	public static void main(String[] args) {
		//날짜얻기(LocalDate)
		LocalDate currDate = LocalDate.now(); //현재의 날짜 얻기 now();
		System.out.println("현재날짜: " + currDate);
		//날짜 강제 세팅하여 객체 생성 (of(년,월,일)→특정 년월일의 날짜 객체 생성)
		LocalDate targetDate = LocalDate.of(2024, 5, 10);
		System.out.println("목표날짜: "+targetDate);
		
		//시간얻기(LocalTime)
		LocalTime currTime = LocalTime.now(); //현재의 시각 얻기 now();
		System.out.println("현재시각: " + currTime);
		//시간 강제세팅하여 객체 생성(of(시,분,초,밀리초)
		LocalTime targetTime = LocalTime.of(6, 30, 0,0);
		System.out.println("목표시각: "+targetTime);
		
		//날짜와 시간 얻기(LocalDateTime)
		LocalDateTime currDateTime = LocalDateTime.now(); //현재의 날짜와 시간 얻기 now();
		System.out.println("현재날짜시각: "+currDateTime);
		//날짜시간 세팅하여 객체 생성 of(년,월,일,시,분,초,밀리초)
		LocalDateTime targetDateTime = LocalDateTime.of(2014, 5, 10, 6, 30,0);
		System.out.println("목표날짜시각: " + targetDateTime);
		
		//협정시 시간존(TimeZone)
		//타임존 설정: ZoneId.of("zone아이디");
		ZonedDateTime utcDateTime = ZonedDateTime.now(ZoneId.of("UTC")); //ZonedDateTime.now(타임존)←설정된 타임존의 날짜와 시간 객체 생성
		System.out.println("UTC: "+utcDateTime);
		//특정지역의 날짜 시간
		ZonedDateTime newYorkDateTime = ZonedDateTime.now(ZoneId.of("Asia/Bangkok"));
		System.out.println("방콕의 현재 시간은: "+newYorkDateTime);
		
		//특정시점의 타임스템프 얻기
		//작업 경과, 시간차, 특정업무중의 시간표시를 위한 용도로 사용
		//시간의 비교 isBefore(), isAfter()
		//경과시간 얻는 메소드 until()
		Instant instant1 = Instant.now(); //현재시점의 time-stamp
		Instant instant2 = null; //로컬변수의 초기화 null
		try {
			Thread.sleep(10); //10밀리초 정지
		instant2 = Instant.now(); //instant1 시점이후의 time-stamp
		if(instant1.isBefore(instant2)) { //isBefore(); : 매개변수보다 앞에 있는게 더 빠른가?
			System.out.println("instant1이 insatnt2보다 빠릅니다.");
		}else if(instant1.isAfter(instant2)){
			System.out.println("instant1이 instant2보다 늦습니다.");
		}else {
			System.out.println("동일한 시간입니다.");
		}
		} catch (InterruptedException e) {}
		System.out.println("차이(nanosec): " + instant1.until(instant2, ChronoUnit.NANOS));
		
	}
}
