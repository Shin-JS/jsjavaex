package p03.dataTypes;
/**
 * 데이터 타입
 * -.자바프로그램에서 연산은 반드시 동일한타입끼리 연산을 한다.
 * -.변수 선언시 초기값으로 입력한 값을 literal이라고 하고, literal도 데이터타입을 가진다.
 * -.연산중간값도 타입을 가진다. 연산중간결과도 타입 변환될 수 있음. 타입이 변환될때는 작은타입의 데이터가 큰 데이터 타입으로 자동변환됨(ex. int→long, float→double)
 * -.10진수 12.375 → 2진수로 바꾸기
 *   =>1100.011(2진수)
 **/
public class DataType3Example {
	public static void main(String[] args) {
		double result;
		int a = 1;  // '='은 대입연산자, 1이라는 정수타입의 리터럴을 정수타입의 변수a에 대입하라는 의미 
		int b = 2;  // '='연산자를 기준으로 왼쪽과 오른쪽의 타입이 같아야 한다.
		double c = 0.5; //0.5더블타입값을 더블타입의 변수 c에 대입하라는 의미
		result = (a + b) * c; //int타입 a와 int타입 b가 연산을 함(결과는 int타입), ()안의 연산을 한 결과는 int값과 * 연산을 하는 c는 double임.
							  //*연산자를 기준으로 왼쪽은 int, 오른쪽은 double, 이때, int가 double로 타입이 자동 변경됨. double*double형식으로 바뀌어 double가 됨.
		System.out.println("result= " + result);
	}
}
