package p03.methods;
/** static, instance
 * 
 **/
public class Product {
	//필드
	//static필드는 주로 공용으로 사용되는경우 선언
	static int count = 0; //static필드(정적필드)
	int serialNo; //instance필드
	//초기화 블럭
	{
		++count; //count를 1증가
		serialNo = count; //instance변수인 serialNo에 1증가된 count가 대입됨
	}
	//생성자
	Product(){}
	//메소드
	void print() {
		System.out.println("count = " + count);
	}
}
