package p04.fileInfo;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**파일정보
 * 	-.File클래스: 파일 정보를 저장하거나 파일을 조작하는 클래스
 **/
public class FileExample {
	public static void main(String[] args) throws IOException {
		File dir = new File("c:/temp/Dir"); //모두 파일로 간주(폴더나.. 파일이나)
		File file1 = new File("c:/temp/file1.txt");
		File file2 = new File("c:/temp/file2.txt");
		if(dir.exists()==false) {
			dir.mkdirs(); //파일 생성(디렉토리 생성)
		}
		if(file1.exists()==false) {
			file1.createNewFile();
		}
		if(file2.exists()==false) {
			file2.createNewFile();
		}
		File temp = new File("c:/temp"); //temp디렉토리의 정보객체
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd aa HH:mm");
		File[] contents = temp.listFiles(); //파일이 디렉토리면 안의 파일 리스트를 출력
		
		for(File file:contents) {
			System.out.print(sdf.format(new Date(file.lastModified()))); //최종 수정 정보 출력 메소드: lastModified()
			if(file.isDirectory()) { //디렉토리이면
				System.out.print("\t<DIR>\t\t\t"+file.getName()); //getName: 파일이름 출력
			}else {
				System.out.print("\t\t\t"+file.length()+"\t"+file.getName()); //
			}
			System.out.println();
		}
		
		
		
		
	}
}
