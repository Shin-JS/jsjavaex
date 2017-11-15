package test;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

public class GoodsExample {
	public static void main(String[] args) {
		Goods goods = new Goods("새우깡",1000);
		Scanner scanner = new Scanner(System.in);
		System.out.println("현재 날짜를 입력하세요(ex19990101): ");
		String date = scanner.next();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
		LocalDate localDate = LocalDate.parse(date,formatter);
		LocalDate startDate = LocalDate.of(2017, 11, 15); //이벤트 시작일 지정
		LocalDate endDate = LocalDate.of(2017, 11, 18); //이벤트 종료일 지정
		GoodsEvent event= new GoodsEvent(goods,startDate,endDate);
		event.events(localDate);

		//새우깡의 정상가격은 1000원, 새우깡의 가격다운 행사기간은 2017-11-15 ~ 2017-11-18
		//이 기간동안의 행사가격은 800원(20%↓), 기간이 지나면 정상가격으로 복귀
		//Event객체 생성 해서 날짜비교 후 상품명과 가격 출력
		//시작날짜, 종료날짜입력 및 parse()메소드 사용
		

	}
}
