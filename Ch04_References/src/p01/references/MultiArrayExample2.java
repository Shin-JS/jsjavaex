package p01.references;
/**
 * 2차원배열(2) 
 **/
public class MultiArrayExample2 {
	public static void main(String[] args) {
		int[][] a = {{12,45,23},{16,4,879},{45,87,12}}; //배열의 초기값을 알고있을때, 길이가 3인 1차원배열이 3개
		for(int i = 0; i<a.length;i++) {
			for(int j= 0; j<a[i].length;j++) {
				System.out.print("a["+i+"]"+"["+j+"]="+a[i][j]+"\t");
			}System.out.println();
		}
		System.out.println("===========================================");
		//향상된 for문(for each)문을 이용한 배열요소의 출력
		int k = 0;
		for(int[] i:a) {
			int z = 0;
			for(int j:i) {
				System.out.print("a["+k+"]"+"["+z+"]="+j+"\t");
				z++;
			}
			z = 0;
			System.out.println();
			k++;
		}
	}
}
