package p03.methods;
/** [메소드]
 *  동일 클래스내의 메소드 호출
 *  -.외부객체에서 메소드 호출시처럼 참조변수.메소드명();하지 않고, 
 *    메소드명();으로 호출하여 결과값을 사용할 수 있음.
 **/
public class Calculator2 {
	
	int plus(int x, int y) { //리턴타입이 int타입인 메소드
		int result = x+y;
		return result;
	}
	
	double avg(int x, int y) { //리턴타입이 double인 메소드
		double sum = plus(x,y); //동일클래스내의 plus()메소드 호출
		double result = sum/2;
		return result;
	}
	
	void execute() { //리턴타입이 void인메소드
		double result = avg(7,10); //동일클래스내의 avg()메소드 호출
		println("실행결과: " +result); //동일클래스내의 println()메소드 호출
	}
	
	void println(String message) {//리턴타입이 void인메소드
		System.out.println(message);
	}
}
