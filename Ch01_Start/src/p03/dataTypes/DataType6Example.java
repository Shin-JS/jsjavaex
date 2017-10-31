package p03.dataTypes;
/**
 *  데이터 타입, 리터럴
 *  data타입
 *  -.정수타입, 실수타입의 2종류
 *  -.정수타입의 기본타입은 int
 *  -.실수타입의 기본타입은 double
 *  
 * **/
public class DataType6Example {
	public static void main(String[] args) {
		double var1 = 3.14; //실수타입데이터의 기본타입은 double
		float var2 = 3.14F; //float은 실수타입데이터의 기본타입이 아니므로 실수리터럴뒤에 F를 붙여줘야함(안붙일경우 오류)
		float var3 = 3.14F;  //실수리터럴+f로 표시된 float타입의 리터럴
		
		double var4 = 0.1234567890123456789;
		float var5 = 0.1234567890123456789F;
		
		System.out.println("var1= " +var1);
		System.out.println("var2= " +var2);
		System.out.println("var3= " +var3);
		System.out.println("var4= " +var4); //출력시 소수부분은 double타입에서 인정하는 정도까지 출력
		System.out.println("var5= " +var5); //출력시 소수부분은 float타입에서 인정하는 정도까지 출력
		
		int var6 = 3000000;
		double var7 = 3e6; //3*10^6
		float var8 = 3e6f; //3*10^6
		double var9 = 2e-3; //2*10^-3
		
		System.out.println("var6= " +var6);
		System.out.println("var7= " +var7);
		System.out.println("var8= " +var8);
		System.out.println("var9= " +var9);
		
	}
}
