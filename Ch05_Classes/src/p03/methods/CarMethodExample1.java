package p03.methods;

import java.util.Scanner;

/**[메소드]
 * 
 **/
public class CarMethodExample1 {
	public static void main(String[] args) {
		Car mycar = new Car(); //car instance생성 및 참조변수 대입
		mycar.setGas(5); //참조변수.메소드(실제값); (메소드 호출)
		System.out.println("초기값: "+mycar.gas);
		
		boolean gasState = mycar.isLeftGas(); //isLeftGas()메소드가 boolean타입을 리턴하므로 리턴값을 받는 변수는 boolean타입이 선언되었음
		if(gasState) {
			System.out.println("출발");
			mycar.run(); //mycar의 run()메소드 호출
		}
		
		if(mycar.isLeftGas()) {//if()내의 값이 true면
			System.out.println("주유할 필요가 없습니다.");
		}else {
			System.out.println("주유하세요");
		}		
	}
}
