package p03.methods;
/**
 * Java 상수 → final
 **/
public class FinalExample1 {
	public static void main(String[] args) {
		F1 f1 = new F1(); //instance 생성
		f1.a1 = 15; //a1은 변수성격을 가진 필드이므로 15로 변경가능
//		f1.A2 = 20 //A2는 상수성격을 가진 필드이므로 더이상 변경 불가(그런고로 오류가 발생함)
	}
}

class F1{
	//필드
	int a1 = 7; //변수의 성격을 가진 필드
	final int A2 = 10; //상수의 성격을 가진 필드->대문자 표시
}