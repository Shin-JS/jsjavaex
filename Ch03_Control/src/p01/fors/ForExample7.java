package p01.fors;
/**
 * for  
 **/
public class ForExample7 {
	public static void main(String[] args) {
		//구구단(ForExample2참고)
		for (int i = 2; i <= 9 ; i++) {
			for (int j = 1; j <= 9 ; j++) {
				String prtst = i + "x" + j +" = " + (i * j);
				System.out.printf("%8s\t",prtst); //"%8s"String형태로 출력, 8자리로 출력하겠다는 표시임.
			}System.out.println();
		}//구구단 가로 출력
		System.out.println("=============================");
		//구구단 세로 출력
		for (int i = 1; i <= 9; i++) {
			for (int j = 2; j <= 9; j++ ) {
				System.out.print(j + "x" + i +"=" + (i * j) + "\t");
			}System.out.println();
		}
	}
}
