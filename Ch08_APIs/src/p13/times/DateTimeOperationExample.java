package p13.times;

import java.time.LocalDateTime;

/**[API]
 * java.time패키지
 *	*LocalDateTime에서 날짜 더하고 빼기
 *	-.더하기: plus + [년|월|일|시|분|초]
 *	-.빼기: minus + [년|월|일|시|분|초]
 **/
public class DateTimeOperationExample {
	public static void main(String[] args) {
		//내 pc의 현재날짜 시간 객체 생성
		LocalDateTime now = LocalDateTime.now(); //현재시간 now()
		System.out.println("현재시: "+now);
		//minus(plus)+(년,월,일)(숫자)//상대적으로 변경
		LocalDateTime targetDateTime = now.plusYears(1)/*1년이후*/.minusMonths(2)/*2달전*/.plusDays(3)/*3일후*/.plusHours(4)/*4시간뒤*/.minusMinutes(5)/*5분전*/.plusSeconds(6)/*6초뒤*/;
		System.out.println("결과: "+targetDateTime);
	}
}
