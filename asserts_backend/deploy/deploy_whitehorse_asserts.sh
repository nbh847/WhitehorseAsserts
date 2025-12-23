#!/bin/bash
# 功能说明
# ./deploy_whitehorse_asserts.sh -- 默认不带任何参数，执行部署前后端代码的操作
# ./deploy_whitehorse_asserts.sh update_frontend -- 编译前端代码之后，执行部署前后端代码的操作
# ./deploy_whitehorse_asserts.sh save -- 执行保存代码的操作

# ------------- 保存代码 -------------
# 传入 save 参数，则执行保存代码的操作
if [[ $1 == "save" ]]; then
    # 切换到工作区目录
    cd workspace/WhitehorseAsserts || {
        echo "无法切换到工作区目录，脚本停止。"
        exit 1
    }
    # 执行保存代码的操作
    git add .
    git commit -m "保存线上的数据"
    # 拉取并合并远程代码
    if ! git pull --rebase; then
        echo "git pull --rebase 失败，可能存在冲突，脚本停止。"
        exit 1
    fi
    # 推送代码到远程仓库
    if ! git push; then
        echo "git push 失败，脚本停止。"
        exit 1
    fi
    echo "代码保存并推送成功。"

    # 执行命令 cd asserts_backend， 然后 source venv/bin/activate 进入虚拟环境， 再执行
    # pip install akshare --upgrade -i https://pypi.org/simple 更新 akshare 库，这个库经常升级，最好每次保存的时候都升级一下
    cd asserts_backend || {
        echo "无法切换到 asserts_backend 目录，脚本停止。"
        exit 1
    }
    source venv/bin/activate || {
        echo "无法激活虚拟环境，脚本停止。"
        exit 1
    }
    pip install akshare --upgrade -i https://pypi.org/simple || {
        echo "更新 akshare 库失败，脚本停止。"
        exit 1
    }

    echo "保存代码的流程执行完毕。"
    exit 0
fi

# ------------- 部署代码 -------------
# 切换到指定目录
cd /root/workspace/WhitehorseAsserts || {
    echo "无法切换到指定目录，脚本停止。"
    exit 1
}

# 直接在 if 语句中执行 git pull --rebase 并检查退出状态
if ! git pull --rebase; then
    echo "git pull --rebase 失败，可能存在未保存的代码，脚本停止。"
    exit 1
fi

echo "代码拉取成功。"

# 尝试重启 whitehorse_backend_asserts 服务
if ! supervisorctl restart whitehorse_backend_asserts; then
    echo "重启 whitehorse_backend_asserts 服务失败，脚本停止。"
    exit 1
fi

echo "whitehorse_backend_asserts 服务重启成功。"

# 切换到前端代码目录
cd /root/workspace/WhitehorseAsserts || {
    echo "无法切换到前端代码目录，脚本停止。"
    exit 1
}

# 检查是否传入 update_frontend 参数
if [[ $1 == "update_frontend" ]]; then
    # 执行前端编译命令
    if ! npm run build; then
        echo "前端编译失败，脚本停止。"
        exit 1
    fi
    echo "前端编译完成。"
fi

# 重启前端服务
if ! supervisorctl restart whitehorse_frontend_asserts; then
    echo "重启 whitehorse_frontend_asserts 服务失败，脚本停止。"
    exit 1
fi
echo "whitehorse_frontend_asserts 服务重启成功。"