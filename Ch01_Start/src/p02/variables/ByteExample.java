package p02.variables;
/**
 * 변수 선언과 사용
 * 변수선언: 타입 변수명
 * main()이라는 메소드 내에서 선언된 변수는 
 * {}이 블럭을 벗어나는순간 메모리에서 사라진다.
 * 메소드내에서 선언된 변수는 로컬변수라고 한다.
 * 로컬변수는 메소드블럭{}을 벗어나는 순간 메모리에서 사라지기때문에
 * 메소드밖에서 사용할 수 없다.
 **/
public class ByteExample {
	public static void main(String[] args) {
//		변수의 선언
//		타입 변수명; 변수명 = 값;
//		타입 변수명 = 값; 의 2가지 종류
		byte var1 = -128;
		byte var2 = -30;
		byte var3 = 0;
		byte var4;
		var4 = 30;
		byte var5;
		var5 = 127;
		System.out.println("var1= " + var1);
		System.out.println("var2= " + var2);
		System.out.println("var3= " + var3);
		System.out.println("var4= " + var4);
		System.out.println("var5= " + var5);
		
	}

}
