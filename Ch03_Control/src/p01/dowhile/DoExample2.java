package p01.dowhile;
/**
 * 이중 do-while()문 
 **/
public class DoExample2 {
	public static void main(String[] args) {
		int i = 1;
		int j = 2;
		do {
			do {
				System.out.print(j + "x" + i + "=" + i*j + "\t");
				j++;//증가식
			} while (j<=9); //조건식
			System.out.println();
			i++; //바깥쪽 do while문의 증가식
			j = 2; //안쪽 do-while()문에서 사용될 변수 j의 초기화
		} while (i<=9);
		System.out.println("i:" + i);
	}
}
