package p13.times;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**[API]
 * java.time패키지
 * 파싱,포맷팅
 **/
public class DateParsingExample {
	public static void main(String[] args) {
		DateTimeFormatter formatter;
		LocalDate localDate;
		//parse(): 문자열의 내용을 읽어서 원하는 형태로 변환
		localDate = LocalDate.parse("2024-05-21");
		System.out.println(localDate);
		
		formatter = DateTimeFormatter.ISO_LOCAL_DATE;
		//입력한 문자열 "2024-05-21"이 위에서 만든 형식인 ISO_LOCAL_DATE에 맞는지 확인 후 맞으면 데이터타입으로 만들어 줌, 안맞는경우 오류(익셉션)발생
		localDate = LocalDate.parse("2024-05-21",formatter);
		System.out.println(localDate);
		
		formatter = DateTimeFormatter.ofPattern("yyyy/MM/dd"); //매개변수로받은 패턴이 맞는지 확인 후 데이터타입으로 ...
		localDate = LocalDate.parse("2024/05/21",formatter);
		System.out.println(localDate);
		
		formatter = DateTimeFormatter.ofPattern("yyyy.MM.dd"); //매개변수로받은 패턴이 맞는지 확인 후 데이터타입으로 ...
		localDate = LocalDate.parse("2024.05.21",formatter);
		System.out.println(localDate);
		
	}
}
