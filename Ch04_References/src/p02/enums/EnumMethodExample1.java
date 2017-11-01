package p02.enums;
/**
 * 열거형타입의 메소드 사용 
 **/
public class EnumMethodExample1 {
	public static void main(String[] args) {
		//name()메소드
		Week today = Week.SUNDAY; //열거형 변수의 선언 및 초기화
		String name = today.name();
		System.out.println(name);
		
		//ordinal()Method - 열거형 상수의 index순번 리턴
		int ordinal = today.ordinal();
		System.out.println(ordinal);
		
		//compareTo()Method
		Week day1 = Week.MONDAY;
		Week day2 = Week.WEDNESDAY;
		int result1 = day1.compareTo(day2); //day1기준 비교대상과의 순서 비교
		int result2 = day2.compareTo(day1); //
		//compareTo()의 결과값: a.compareTo(b)=> a>b이면 양의값 리턴, a==b이면 0을 리턴, a<b이면 음의값 리턴 (a,b내의 속성값으로 비교)
		System.out.println(result1);
		System.out.println(result2);
		
		//valueOf() Method
		if(args.length==1) {
			String strDay = args[0]; //main() Method의 args로 받음
			Week weekDay = Week.valueOf(strDay); //String형태로 받은 값으로 enum에서 가져옴(?)
			if(weekDay==Week.SATURDAY||weekDay==Week.SUNDAY) {
				System.out.println("주말은 쉽니다.");
			}else {
				System.out.println("평일도 쉽니다");
			}
		}
		
		//values()Method
		Week[] days = Week.values();
		for(Week day:days) {
			System.out.print(day + "\t");
		}System.out.println();
	}
}
